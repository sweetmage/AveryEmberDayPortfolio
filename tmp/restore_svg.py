import subprocess

# Get the stashed version of the SVG
result = subprocess.run(
    ['git', 'show', 'stash@{0}:images/icons/BubbleLogo/bubbleLogo-black.svg'],
    capture_output=True,
    text=True,
    cwd=r"D:\My Stuff\Git\CometGit\portfoliowebsite"
)

if result.returncode == 0:
    with open(r"D:\My Stuff\Git\CometGit\portfoliowebsite\images\icons\BubbleLogo\bubbleLogo-black.svg", 'w', encoding='utf-8') as f:
        f.write(result.stdout)
    print("SVG restored from stash")
else:
    print(f"Error: {result.stderr}")
