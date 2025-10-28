"""
Generate a pre-computed search index for all job titles.
This creates a JSON file with fuzzy + vector search results for common queries.
"""

import json
import os
from rapidfuzz import fuzz, process
from sentence_transformers import SentenceTransformer
import numpy as np
from kaggle_data_loader import get_loader

def generate_search_index():
    """
    Generate a comprehensive search index for all job titles.
    """
    print("Loading dataset...")
    data_loader = get_loader()
    if data_loader.df is None:
        data_loader.load_dataset()
    
    # Get all unique job titles
    job_titles = data_loader.df['Job Title'].unique().tolist()
    print(f"Found {len(job_titles)} unique job titles")
    
    # Load sentence transformer for vector search
    print("Loading sentence transformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Computing embeddings...")
    embeddings = model.encode(job_titles, show_progress_bar=True)
    
    # Create job data lookup
    print("Creating job data lookup...")
    job_data_map = {}
    for job_title in job_titles:
        job_row = data_loader.df[data_loader.df['Job Title'] == job_title].iloc[0]
        job_data_map[job_title] = {
            'job_title': job_title,
            'industry': str(job_row.get('Industry', 'Unknown')),
            'location': str(job_row.get('Location', 'Unknown')),
            'automation_risk': float(job_row.get('AI Automation Risk', 0)),
            'growth_projection': float(job_row.get('Job Growth Projection (%)', 0))
        }
    
    # Generate search index
    print("Generating search index...")
    search_index = {
        'job_titles': job_titles,
        'job_data': job_data_map,
        'metadata': {
            'total_jobs': len(job_titles),
            'embedding_dim': embeddings.shape[1],
            'model': 'all-MiniLM-L6-v2'
        }
    }
    
    # Pre-compute common search queries
    print("Pre-computing common queries...")
    common_queries = [
        # Tech roles
        'software', 'developer', 'engineer', 'programmer', 'data', 'analyst',
        'scientist', 'web', 'mobile', 'frontend', 'backend', 'fullstack',
        'devops', 'cloud', 'security', 'network', 'database', 'qa', 'test',
        # Business roles
        'manager', 'director', 'executive', 'consultant', 'analyst', 'accountant',
        'sales', 'marketing', 'hr', 'finance', 'legal', 'admin',
        # Other roles
        'teacher', 'nurse', 'doctor', 'designer', 'writer', 'architect',
        'engineer', 'technician', 'specialist', 'coordinator', 'assistant'
    ]
    
    query_cache = {}
    for query in common_queries:
        # Fuzzy search
        fuzzy_matches = process.extract(
            query,
            job_titles,
            scorer=fuzz.token_sort_ratio,
            limit=15
        )
        
        # Vector search
        query_embedding = model.encode([query])[0]
        similarities = np.dot(embeddings, query_embedding) / (
            np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        top_indices = np.argsort(similarities)[::-1][:15]
        
        query_cache[query] = {
            'fuzzy': [
                {
                    'job_title': match[0],
                    'confidence': float(match[1]),
                    'match_method': 'fuzzy'
                }
                for match in fuzzy_matches
            ],
            'vector': [
                {
                    'job_title': job_titles[idx],
                    'confidence': float(similarities[idx]) * 100,
                    'match_method': 'vector'
                }
                for idx in top_indices
            ]
        }
    
    search_index['query_cache'] = query_cache
    
    # Convert embeddings to list for JSON serialization
    print("Serializing embeddings...")
    search_index['embeddings'] = embeddings.tolist()
    
    # Save to JSON
    output_file = os.path.join(
        os.path.dirname(__file__),
        '../public/search_index.json'
    )
    print(f"Saving search index to {output_file}...")
    
    with open(output_file, 'w') as f:
        json.dump(search_index, f, separators=(',', ':'))
    
    file_size = os.path.getsize(output_file) / 1024 / 1024
    print(f"\n✓ Successfully generated search index!")
    print(f"  File: {output_file}")
    print(f"  Size: {file_size:.2f} MB")
    print(f"  Jobs: {len(job_titles)}")
    print(f"  Cached queries: {len(query_cache)}")
    
    return search_index

if __name__ == '__main__':
    generate_search_index()

