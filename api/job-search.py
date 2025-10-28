"""
Vercel Python Serverless Function for Hybrid Job Search
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import pickle
import numpy as np
from rapidfuzz import fuzz, process
from typing import List, Dict, Tuple

class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""
    
    # Load data once when the function initializes (stays in memory between invocations)
    _embeddings = None
    _job_titles = None
    _job_data = None
    _model = None
    
    @classmethod
    def load_data(cls):
        """Load embeddings and job data (cached across invocations)"""
        if cls._job_titles is not None:
            return  # Already loaded
        
        # Load embeddings
        embeddings_path = os.path.join(os.path.dirname(__file__), 'job_embeddings.pkl')
        if os.path.exists(embeddings_path):
            with open(embeddings_path, 'rb') as f:
                data = pickle.load(f)
                cls._job_titles = data['job_titles']
                cls._embeddings = data['embeddings']
        
        # Load job market data (simplified version for quick lookup)
        # We'll use a pre-generated JSON file instead of the full CSV
        job_data_path = os.path.join(os.path.dirname(__file__), 'job_data.json')
        if os.path.exists(job_data_path):
            with open(job_data_path, 'r') as f:
                cls._job_data = json.load(f)
    
    def fuzzy_search(self, query: str, top_k: int = 10) -> List[Tuple[str, float, str]]:
        """Perform fuzzy string matching"""
        matches = process.extract(
            query,
            self._job_titles,
            scorer=fuzz.token_sort_ratio,
            limit=top_k
        )
        return [(match[0], match[1], 'fuzzy') for match in matches]
    
    def vector_search(self, query: str, top_k: int = 10) -> List[Tuple[str, float, str]]:
        """Perform vector similarity search"""
        if self._embeddings is None:
            return []
        
        # Lazy load the model only when needed
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Encode query
        query_embedding = self._model.encode([query])[0]
        
        # Compute cosine similarities
        similarities = np.dot(self._embeddings, query_embedding) / (
            np.linalg.norm(self._embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        
        # Get top k
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        return [
            (self._job_titles[idx], float(similarities[idx]) * 100, 'vector')
            for idx in top_indices
        ]
    
    def hybrid_search(self, query: str, top_k: int = 10, fuzzy_threshold: float = 85.0) -> List[Dict]:
        """Perform hybrid search: fuzzy first, then vector if needed"""
        if not query or len(query) < 2:
            return []
        
        # Step 1: Try fuzzy matching
        fuzzy_results = self.fuzzy_search(query, top_k=top_k)
        best_fuzzy_score = fuzzy_results[0][1] if fuzzy_results else 0
        
        # Step 2: Use vector search if fuzzy confidence is low
        if best_fuzzy_score >= fuzzy_threshold:
            results = fuzzy_results
        else:
            vector_results = self.vector_search(query, top_k=top_k)
            results = vector_results if vector_results else fuzzy_results
        
        # Convert to output format
        output = []
        for job_title, confidence, method in results:
            # Get job data from pre-loaded dictionary
            job_info = self._job_data.get(job_title, {})
            
            output.append({
                'job_title': job_title,
                'confidence': float(confidence),
                'match_method': method,
                'industry': job_info.get('industry', 'Unknown'),
                'location': job_info.get('location', 'Unknown'),
                'automation_risk': job_info.get('automation_risk', 0),
                'growth_projection': job_info.get('growth_projection', 0)
            })
        
        return output
    
    def do_POST(self):
        """Handle POST request"""
        try:
            # Load data (cached across invocations)
            self.load_data()
            
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            query = data.get('query', '').strip()
            
            if len(query) < 2:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'suggestions': []}).encode())
                return
            
            # Perform hybrid search
            results = self.hybrid_search(query, top_k=15)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'suggestions': results,
                'total_matches': len(results)
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

