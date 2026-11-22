import docx

doc = docx.Document('docs/ST_OtherComponent.docx')
text = ' '.join(p.text for p in doc.paragraphs)
for t in doc.tables:
    for row in t.rows:
        text += ' ' + ' '.join(cell.text for cell in row.cells)

keywords = [
    'Omprakash Panda', '1MS24IS411',
    'Sindhu BL', '1MS24IS413',
    'Vittal GB', '1MS23IS151',
    'Pushpalatha Nidagal',
    '7th Semester', 'Section "B"',
    'online-auction-system', 'ecd4de475fdf49d54153ffaa57d42b392161007a',
    'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5',
    'Equivalence Partitioning', 'Boundary Value Analysis',
    'Decision Tables', 'State Transition',
    'D-01', 'D-02', 'D-07', 'D-10', 'D-11', 'D-16', 'D-18',
    'Playwright', 'Vitest', '85.3%', 'Assessment Scheme', '20 Marks'
]

all_found = True
for kw in keywords:
    present = kw in text
    print(f'{kw:40} -> {"FOUND" if present else "MISSING"}')
    if not present:
        all_found = False

print(f"\nAll keywords verified: {all_found}")
