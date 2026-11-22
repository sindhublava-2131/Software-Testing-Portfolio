import glob
import re

replacements = [
    (r'import\s+\{\s*User\s*\}\s+from\s+([\'"].*models/user\.model\.js[\'"])', r'import User from \1'),
    (r'import\s+\{\s*Product\s*\}\s+from\s+([\'"].*models/product\.model\.js[\'"])', r'import Product from \1'),
    (r'import\s+\{\s*Upload\s*\}\s+from\s+([\'"].*models/upload\.model\.js[\'"])', r'import Upload from \1'),
    (r'import\s+\{\s*Login\s*\}\s+from\s+([\'"].*models/login\.model\.js[\'"])', r'import Login from \1')
]

for filepath in glob.glob('05_Test_Automation/**/*.js', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Updated imports in:', filepath)
