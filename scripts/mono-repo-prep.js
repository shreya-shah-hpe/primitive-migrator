const { from, switchMap, concat, toArray, catchError, of, tap, map } = require('rxjs');
const fs = require('fs').promises;
const path = require('path');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const BranchName = 'button-migration-mono-repo';

/**
 * Exec
 * @param {*} cmd 
 * @returns 
 */
const exec$ = cmd => from(exec(cmd)).pipe(
    catchError(() => of(cmd))
)

/**
 * Rpose
 */
const repos = {

    // 'stencil-anchor': {
    //     repo: 'https://github.com/hpe-cds/stencil-anchor',
    // },
    'stencil-button': {
        repo: 'https://github.com/shreya-shah-hpe/stencil-button',
    },
    // 'stencil-grid': {
    //     repo: 'https://github.com/hpe-cds/stencil-grid',
    // },
    // 'stencil-icon': {
    //     repo: 'https://github.com/hpe-cds/stencil-icon',
    // },
    // 'stencil-pagination': {
    //     repo: 'https://github.com/hpe-cds/stencil-pagination',
    // },
    // 'stencil-progress-bar': {
    //     repo: 'https://github.com/hpe-cds/stencil-progress-bar',
    // },
    // 'stencil-tooltip': {
    //     repo: 'https://github.com/hpe-cds/stencil-tooltip',
    // },
    // 'stencil-text': {
    //     repo: 'https://github.com/hpe-cds/stencil-text',
    // },
    // 'stencil-checkbox': {
    //     repo: 'https://github.com/hpe-cds/stencil-checkbox',
    // },
    // 'stencil-container': {
    //     repo: 'https://github.com/hpe-cds/stencil-container',
    // },
    // 'stencil-flash': {
    //     repo: 'https://github.com/hpe-cds/stencil-flash',
    // },
    // 'stencil-menu': {
    //     repo: 'https://github.com/hpe-cds/stencil-menu',
    // },
    // 'stencil-modal': {
    //     repo: 'https://github.com/hpe-cds/stencil-modal',
    // },
    // 'stencil-spinner': {
    //     repo: 'https://github.com/hpe-cds/stencil-spinner',
    // },
    // 'stencil-table': {
    //     repo: 'https://github.com/hpe-cds/stencil-table',
    // },
    // 'stencil-tabs': {
    //     repo: 'https://github.com/hpe-cds/stencil-tabs',
    // },
    // 'stencil-search': {
    //     repo: 'https://github.com/hpe-cds/stencil-search',
    // },
    // 'stencil-toolbar': {
    //     repo: 'https://github.com/hpe-cds/stencil-toolbar',
    // },
    // 'stencil-drawer': {
    //     repo: 'https://github.com/hpe-cds/stencil-drawer',
    // },
}

/**
 * Download Repo
 */
const cloneRepo$ = (url) => exec$(`git clone ${url}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: path.resolve(__dirname, '../'),
})

/**
 * Move Files
 */
const moveFiles$ = (package) => {
    const mkdirPackagesDir$ = () => exec$(`cd ${package} && mkdir ./packages`)
    const mkdirPackagesName$ = () => exec$(`cd ${package} && mkdir ./packages/${package}`)

    const moveCmd = (file) => `cd ${package} && git mv ./${file} ./packages/${package}/${file}`;
    const mvSVG$ = () => exec$(moveCmd('namespace-ready.svg'))
    const mvPackage$ = () => exec$(moveCmd('package.json'))
    const mvReadme$ = () => exec$(moveCmd('readme.md'))
    const mvTSConfig$ = () => exec$(moveCmd('tsconfig.json'))
    const mvStencilConfig$ = () => exec$(moveCmd('stencil.config.ts'))
    const mvCypressConfig$ = () => exec$(moveCmd('cypress.config.ts'))
    const mvSrc$ = () => exec$(moveCmd('src'))
    const mvStorybook$ = () => exec$(moveCmd('.storybook'))

    const removeCmd = (file) => `cd ${package} && rm -rf ${file}`;
    const removeCopyrightignore$ = () => exec$(removeCmd('.copyrightignore'))
    const removeGitIgnore$ = () => exec$(removeCmd('.gitignore'))
    const removeNPMRC$ = () => exec$(removeCmd('.npmrc'))
    const removePrettierIgnore$ = () => exec$(removeCmd('.prettierignore'))
    const removePrettierJson$ = () => exec$(removeCmd('.prettierrc.json'))
    const removeEslintIgnore$ = () => exec$(removeCmd('.eslintignore'))
    const removeEslintJson$ = () => exec$(removeCmd('.eslintrc.json'))
    const removeEslintJs$ = () => exec$(removeCmd('.eslintrc.js'))
    const removeCodeowners$ = () => exec$(removeCmd('CODEOWNERS'))
    const removeGithub$ = () => exec$(removeCmd('.github'))
    const removePackageLock$ = () => exec$(removeCmd('package-lock.json'))
    const removeMakeFile$ = () => exec$(removeCmd('Makefile'))
    const removeEditorConfig$ = () => exec$(removeCmd('editorconfig'))
    const removeTsConfigEslintJson$ = () => exec$(removeCmd('tsconfig.eslint.json'))
    const removeUtils$ = () => exec$(removeCmd('utils'))

    return mkdirPackagesDir$().pipe(
        // Moves
        switchMap(mkdirPackagesName$),
        switchMap(mvSVG$),
        switchMap(mvPackage$),
        switchMap(mvReadme$),
        switchMap(mvTSConfig$),
        switchMap(mvStencilConfig$),
        switchMap(mvCypressConfig$),
        // Apply base file
        switchMap(() => applyStencilBaseFile$(package)),
        switchMap(() => applyTSBaseFile$(package)),
        switchMap(() => applyCypressConfig$(package)),
        switchMap(mvSrc$),
        switchMap(mvStorybook$),

        // Remove
        switchMap(removeCopyrightignore$),
        switchMap(removeGitIgnore$),
        switchMap(removeNPMRC$),
        switchMap(removePrettierIgnore$),
        switchMap(removeCodeowners$),
        switchMap(removeGithub$),
        switchMap(removePackageLock$),
        switchMap(removePrettierJson$),
        switchMap(removeEslintJson$),
        switchMap(removeEslintIgnore$),
        switchMap(removeMakeFile$),
        switchMap(removeEditorConfig$),
        switchMap(removeTsConfigEslintJson$),
        switchMap(removeEslintJs$),
        switchMap(removeUtils$),
    )
}

/**
 * Apply Generic Files
 * @param {*} package 
 */
const applyStencilBaseFile$ = (package) => {
    const stencilBaseConfig$ = from(fs.readFile('../base-files/stencil.config.ts', "utf8"));
    return stencilBaseConfig$.pipe(
        map((config) => config.replace(`{{plugingName}}`, package)),
        switchMap((config) => from(fs.writeFile(`${package}/packages/${package}/stencil.config.ts`, config, 'utf8')))
    )
}

/**
 * Apply Generic Files
 * @param {*} package 
 */
const applyTSBaseFile$ = (package) => {
    const tsBaseConfig$ = from(fs.readFile('../base-files/tsconfig.json', "utf8"));
    return tsBaseConfig$.pipe(
        switchMap((config) => from(fs.writeFile(`${package}/packages/${package}/tsconfig.json`, config, 'utf8')))
    )
}

/**
 * Apply Generic Files
 * @param {*} package 
 */
const applyCypressConfig$ = (package) => {
    const cypressConfig$ = from(fs.readFile('../base-files/cypress.config.ts', "utf8"));
    return cypressConfig$.pipe(
        switchMap((config) => from(fs.writeFile(`${package}/packages/${package}/cypress.config.ts`, config, 'utf8')))
    )
}

/**
 * Commit Changes
 * @param {*} package 
 * @returns 
 */
const commitAndPush$ = (package) => exec$(`cd ${package} && git .`).pipe(
    // Add, Commit, Branch
    switchMap(() => exec$(`cd ${package} && git add .`)),
    switchMap(() => exec$(`cd ${package} && git commit -m 'mono repo prep'`)),
    switchMap(() => exec$(`cd ${package} && git checkout -b ${BranchName}`)),

    // Push
    tap(() => console.log(`cd ${package} && git push --set-upstream origin ${BranchName}`)),
    switchMap(() => exec$(`cd ${package} && git push --set-upstream origin ${BranchName}`)),
)

/**
 * Clone Mono Repo
 * @returns 
 */
// cloneRepo$('https://github.com/rhys-devine-hpe/primitive-components.git')
const mergeReposAndCreatePR$ = (repo) => cloneRepo$('https://github.com/hpe-cds/primitive-components.git').pipe(
    // Merge Repose
    switchMap(() => exec$(`cd primitive-components && git remote add repo2 '${repo}'`)),
    switchMap(() => exec$(`cd primitive-components && git fetch repo2 --tags`)),
    switchMap(() => exec$(`cd primitive-components && git merge --allow-unrelated-histories repo2/${BranchName} -m "Commit Message" --no-ff`)),
    // switchMap(() => exec$(`cd primitive-components && git remote rm repo2`)),
   
    // // Add, Commit, Branch
    switchMap(() => exec$(`cd primitive-components && git add .`)),
    switchMap(() => exec$(`cd primitive-components && git commit -m 'mono repo prep'`)),
    switchMap(() => exec$(`cd primitive-components && git checkout -b ${BranchName}`)),

    // // // Push
    tap(() => console.log(`cd primitive-components && git push --set-upstream origin ${BranchName}`)),
    switchMap(() => exec$(`cd primitive-components && git push --set-upstream origin ${BranchName}`)),
)

/**
 * Do Ya thing
 * @param {*} param0 l
 * @returns 
 */
const doYaThing$ = ([key, { repo }]) => cloneRepo$(repo).pipe(
    switchMap(() => moveFiles$(key)),
    switchMap(() => commitAndPush$(key)),
    switchMap(() => mergeReposAndCreatePR$(repo)),
);

const ops$ = Object.entries(repos).map(doYaThing$)
concat(...ops$)
    .pipe(toArray())
    .subscribe({
        error: (err) => console.log('err', err),
        next: (data) => console.log('data', data),
    })
