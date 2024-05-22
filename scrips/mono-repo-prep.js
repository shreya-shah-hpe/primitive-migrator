const path = require('path');
const { from, switchMap, concat, toArray, catchError, of } = require('rxjs');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

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
    'stencil-anchor': {
        repo: 'https://github.com/hpe-cds/stencil-anchor',
    },
    'stencil-button': {
        repo: 'https://github.com/hpe-cds/stencil-button',
    },
    'stencil-grid': {
        repo: 'https://github.com/hpe-cds/stencil-grid',
    },
    'stencil-icon': {
        repo: 'https://github.com/hpe-cds/stencil-icon',
    },
    'stencil-pagination': {
        repo: 'https://github.com/hpe-cds/stencil-pagination',
    },
    'stencil-progress-bar': {
        repo: 'https://github.com/hpe-cds/stencil-progress-bar',
    },
    'stencil-tooltip': {
        repo: 'https://github.com/hpe-cds/stencil-tooltip',
    },
    'stencil-text': {
        repo: 'https://github.com/hpe-cds/stencil-text',
    },
    'stencil-checkbox': {
        repo: 'https://github.com/hpe-cds/stencil-checkbox',
    },
    'stencil-container': {
        repo: 'https://github.com/hpe-cds/stencil-container',
    },
    'stencil-flash': {
        repo: 'https://github.com/hpe-cds/stencil-flash',
    },
    'stencil-menu': {
        repo: 'https://github.com/hpe-cds/stencil-menu',
    },
    'stencil-modal': {
        repo: 'https://github.com/hpe-cds/stencil-modal',
    },
    'stencil-spinner': {
        repo: 'https://github.com/hpe-cds/stencil-spinner',
    },
    'stencil-table': {
        repo: 'https://github.com/hpe-cds/stencil-table',
    },
    'stencil-tabs': {
        repo: 'https://github.com/hpe-cds/stencil-tabs',
    },
    'stencil-search': {
        repo: 'https://github.com/hpe-cds/stencil-search',
    },
    'stencil-toolbar': {
        repo: 'https://github.com/hpe-cds/stencil-toolbar',
    },
    'stencil-drawer': {
        repo: 'https://github.com/hpe-cds/stencil-drawer',
    },
}

// /**
//  * Download Repo
//  */
const downloadRepo$ = (url) => exec$(`git clone ${url}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: path.resolve(__dirname, '../'),
})
/**
 * Download Repo
 */
// const downloadRepo$ = (url) => of('')

/**
 * Move Files
 */
const moveFiles$ = (package) => {
    const mkdirPackagesDir$ = () => exec$(`cd ${package} && mkdir ./packages`)
    const mkdirPackagesName$ = () => exec$(`cd ${package} && mkdir ./packages/${package}`)
    const buildCmd = (file) => `cd ${package} && git mv ./${file} ./packages/${package}/${file}`;
    const mvSVG$ = () => exec$(buildCmd('namespace-ready.svg'))
    const mvPackage$ = () => exec$(buildCmd('package.json'))
    const mvPackageLock$ = () => exec$(buildCmd('package-lock.json'))
    const mvReadme$ = () => exec$(buildCmd('readme.md'))
    const mvTSConfig$ = () => exec$(buildCmd('tsconfig.json'))
    const mvStencilConfig$ = () => exec$(buildCmd('stencil.config.ts'))
    return mkdirPackagesDir$().pipe(
        switchMap(mkdirPackagesName$),
        switchMap(mvSVG$),
        switchMap(mvPackage$),
        switchMap(mvPackageLock$),
        switchMap(mvReadme$),
        switchMap(mvTSConfig$),
        switchMap(mvStencilConfig$)
    )
}


/**
 * Do Ya thing
 * @param {*} param0 
 * @returns 
 */
const doYaThing$ = ([key, { repo }]) => downloadRepo$(repo).pipe(switchMap(() => moveFiles$(key)));
const ops$ = Object.entries(repos).map(doYaThing$)
concat(...ops$)
.pipe(toArray())
.subscribe({
    error: (err) => console.log('err', err),
    next: (data) => console.log('data', data),
})