Primative Component Prerp

# Stage One
The first stage is to Prep Primative compoents
 1. Clone All Primative Repos
 2. Find all common files/foder and move them under new `packages` dir
 3. Create new branch on each repo with the changes


# Stage Two
The next stage is to pull each of the newly created branching into the mono-repo branch
 1. Create new branch on Mono-repo
 2. Merge newly created crerated branch on primative componets into mono repo
 3. Create a new PR on mono-repo to review the changes


> Following the cmd below to merge primative branch into mono-repo
```
cd path/to/project-b
git remote add project-a /path/to/project-a
git fetch project-a --tags
git merge --allow-unrelated-histories project-a/master # or any branch you want to merge
git remote remove project-a
```