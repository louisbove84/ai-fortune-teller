"""
Precompute sentence embeddings for all job titles in the Kaggle dataset.
This script should be run once to generate the embeddings file.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from kaggle_data_loader import JobMarketDataLoader

def precompute_embeddings():
    """
    Load the dataset, extract unique job titles, and compute embeddings.
    Save embeddings to a pickle file for fast loading.
    """
    print("Loading dataset...")
    data_loader = JobMarketDataLoader()
    
    # Ensure dataset is loaded
    if data_loader.df is None:
        data_loader.load_dataset()
    
    # Get unique job titles
    job_titles = data_loader.df['Job Title'].unique()
    print(f"Found {len(job_titles)} unique job titles")
    
    # Load the sentence transformer model
    print("Loading sentence transformer model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Compute embeddings
    print("Computing embeddings (this may take a few minutes)...")
    embeddings = model.encode(job_titles.tolist(), show_progress_bar=True)
    
    # Save embeddings
    embeddings_data = {
        'job_titles': job_titles.tolist(),
        'embeddings': embeddings
    }
    
    output_file = os.path.join(os.path.dirname(__file__), 'job_embeddings.pkl')
    print(f"Saving embeddings to {output_file}...")
    with open(output_file, 'wb') as f:
        pickle.dump(embeddings_data, f)
    
    print(f"✓ Successfully saved {len(job_titles)} job title embeddings!")
    print(f"  File size: {os.path.getsize(output_file) / 1024 / 1024:.2f} MB")
    
    return embeddings_data

if __name__ == '__main__':
    precompute_embeddings()

