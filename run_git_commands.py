import subprocess

cwd = r'D:\My Stuff\Git\CometGit\portfoliowebsite'

def run(cmd):
    print(f'--- Running: {cmd} ---')
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    print(f'returncode: {result.returncode}')
    if result.stdout:
        print(f'stdout:\n{result.stdout}')
    if result.stderr:
        print(f'stderr:\n{result.stderr}')
    print()
    return result

# 1. Stage index.html and style.css, then commit
run('git add index.html style.css')
run('git commit -m "shxdowloop stage 2: Tailwind utility pilot on index.html"')

# 2. Stage netlify.toml, then commit
run('git add netlify.toml')
run('git commit -m "shxdowloop stage 3: Netlify build automation"')

# 3. Push the branch
run('git push')
