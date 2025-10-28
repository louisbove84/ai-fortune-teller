"""
Hybrid job search using fuzzy matching + vector similarity.
"""

import os
import pickle
import numpy as np
from rapidfuzz import fuzz, process
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple

class HybridJobSearch:
    def __init__(self, data_loader):
        """
        Initialize hybrid search with fuzzy + vector capabilities.
        
        Args:
            data_loader: JobMarketDataLoader instance with the dataset
        """
        self.data_loader = data_loader
        self.job_titles = data_loader.df['Job Title'].unique().tolist()
        
        # Try to load precomputed embeddings
        embeddings_file = os.path.join(os.path.dirname(__file__), 'job_embeddings.pkl')
        self.embeddings = None
        self.model = None
        
        if os.path.exists(embeddings_file):
            try:
                print("Loading precomputed job title embeddings...")
                with open(embeddings_file, 'rb') as f:
                    data = pickle.load(f)
                    self.embeddings = data['embeddings']
                    # Verify the embeddings match our job titles
                    if len(data['job_titles']) == len(self.job_titles):
                        print(f"✓ Loaded {len(self.job_titles)} job embeddings")
                    else:
                        print("⚠ Embeddings don't match current dataset, will use fuzzy-only")
                        self.embeddings = None
            except Exception as e:
                print(f"⚠ Could not load embeddings: {e}")
                print("  Will use fuzzy matching only")
        else:
            print("⚠ No precomputed embeddings found. Run precompute_embeddings.py")
            print("  Will use fuzzy matching only")
    
    def fuzzy_search(self, query: str, top_k: int = 10) -> List[Tuple[str, float, str]]:
        """
        Perform fuzzy string matching.
        
        Returns:
            List of (job_title, confidence_score, method) tuples
        """
        # Use token_sort_ratio for better handling of word order
        matches = process.extract(
            query,
            self.job_titles,
            scorer=fuzz.token_sort_ratio,
            limit=top_k
        )
        
        # Convert to our format: (job_title, confidence 0-100, method)
        results = [(match[0], match[1], 'fuzzy') for match in matches]
        return results
    
    def vector_search(self, query: str, top_k: int = 10) -> List[Tuple[str, float, str]]:
        """
        Perform vector similarity search.
        
        Returns:
            List of (job_title, confidence_score, method) tuples
        """
        if self.embeddings is None:
            return []
        
        # Load model if not already loaded
        if self.model is None:
            print("Loading sentence transformer model...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Encode query
        query_embedding = self.model.encode([query])[0]
        
        # Compute cosine similarities
        similarities = np.dot(self.embeddings, query_embedding) / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        
        # Get top k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Convert to our format: (job_title, confidence 0-100, method)
        results = [
            (self.job_titles[idx], float(similarities[idx]) * 100, 'vector')
            for idx in top_indices
        ]
        
        return results
    
    def hybrid_search(self, query: str, top_k: int = 10, fuzzy_threshold: float = 80.0) -> List[Dict]:
        """
        Perform hybrid search: fuzzy first, then vector if needed.
        
        Args:
            query: User's search query
            top_k: Number of results to return
            fuzzy_threshold: If best fuzzy match < this, use vector search
        
        Returns:
            List of dicts with job data + metadata
        """
        if not query or len(query) < 2:
            return []
        
        # Step 1: Try fuzzy matching
        fuzzy_results = self.fuzzy_search(query, top_k=top_k)
        
        # Check if we have a confident fuzzy match
        best_fuzzy_score = fuzzy_results[0][1] if fuzzy_results else 0
        
        if best_fuzzy_score >= fuzzy_threshold:
            # Use fuzzy results
            results = fuzzy_results
            print(f"Using fuzzy match (score: {best_fuzzy_score:.1f})")
        else:
            # Fall back to vector search
            vector_results = self.vector_search(query, top_k=top_k)
            
            if vector_results:
                print(f"Using vector search (fuzzy score {best_fuzzy_score:.1f} < {fuzzy_threshold})")
                results = vector_results
            else:
                # No vector search available, use fuzzy anyway
                print(f"Vector search unavailable, using fuzzy results")
                results = fuzzy_results
        
        # Convert to full job data
        output = []
        for job_title, confidence, method in results:
            # Get the full row from dataset
            job_row = self.data_loader.df[
                self.data_loader.df['Job Title'] == job_title
            ].iloc[0]
            
            output.append({
                'job_title': job_title,
                'industry': str(job_row.get('Industry', 'Unknown')),
                'location': str(job_row.get('Location', 'Unknown')),
                'automation_risk': float(job_row.get('AI Automation Risk', 0)),
                'growth_projection': float(job_row.get('Job Growth Projection (%)', 0)),
                'confidence': float(confidence),
                'match_method': method
            })
        
        return output

