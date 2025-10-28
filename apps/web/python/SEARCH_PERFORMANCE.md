# Hybrid Search Performance Results

## Test Results with 85% Fuzzy Threshold

### ✅ Working Examples

| Query | Best Match | Score | Method | Notes |
|-------|-----------|-------|--------|-------|
| "data scientist" | Data scientist | 92.9% | fuzzy | Exact match |
| "software dev" | Software engineer | 76.7% | vector | Good abbreviation handling |
| "chemical" | Engineer, chemical | 68.9% | vector | Semantic match |
| "accountent" | Chartered accountant | 60.0% | vector | Typo handling (no plain "Accountant" in dataset) |

### ❌ "ml engineer" Issue

**Query:** "ml engineer"
**Expected:** Machine Learning Engineer
**Actual:** Manufacturing engineer (72.1%)

**Why it doesn't work:**
- "Machine Learning Engineer" does NOT exist in the dataset
- Dataset only has 639 unique job titles from general employment data
- The fuzzy match finds "Manufacturing engineer" because "ml" ≈ "manufacturing"
- Vector search also finds "Manufacturing engineer" as closest semantic match

**Dataset Job Titles Include:**
- ✅ Software engineer
- ✅ Data scientist
- ✅ Chemical engineer
- ✅ Mechanical engineer
- ❌ Machine Learning Engineer (not in dataset)
- ❌ AI Engineer (not in dataset)
- ❌ ML Engineer (not in dataset)

## Real-World Performance

### Fuzzy Search (≥85% confidence)
**Best for:**
- Exact titles: "data scientist" → "Data scientist" (92.9%)
- Minor typos: "softwar engineer" → "Software engineer"
- Word variations: "consulting civil engineer" → "Civil engineer, consulting"

### Vector Search (<85% confidence)
**Best for:**
- Abbreviations: "software dev" → "Software engineer" (76.7%)
- Semantic matches: "chemical" → "Engineer, chemical" (68.9%)
- Partial titles: "civil eng" → "Civil engineer"

## Recommendations

1. **For Tech-Focused App:**
   - Consider using a tech-specific dataset with modern roles
   - Add custom mappings for common abbreviations (ml → machine learning)

2. **Current System:**
   - Works well for the 639 job titles in dataset
   - Handles typos, abbreviations, and semantic matches
   - 85% threshold provides good balance

3. **Limitations:**
   - Cannot find jobs not in the dataset
   - "ml" is too ambiguous (could mean: machine learning, mechanical, manufacturing)
   - Dataset appears to be UK-focused (chartered accountants, etc.)

## Dataset Contents

**Total Rows:** 30,000
**Unique Job Titles:** 639
**Sample Categories:**
- Engineers (various types)
- Scientists
- Accountants (chartered variations)
- IT/Software roles
- Teachers
- Medical professionals
- Business roles

