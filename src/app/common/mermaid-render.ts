let renderSeq = 0;
const latestByHost = new WeakMap<HTMLElement, number>();

/**
 * Renders Mermaid code into `host` (mermaid is loaded lazily, strict security level). Several renders into the same
 * host may overlap (typing, polling): only the newest one is shown. Errors are written into the host, not thrown.
 */
export async function renderMermaid(host: HTMLElement, code: string, logTag = 'mermaid'): Promise<void> {
    const seq = ++renderSeq;
    latestByHost.set(host, seq);
    try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({startOnLoad: false, securityLevel: 'strict', theme: 'neutral',
            flowchart: {htmlLabels: true, curve: 'basis'}});
        const {svg} = await mermaid.render('flow-diagram-' + seq, code);
        if (latestByHost.get(host) === seq) {  // a newer render started meanwhile: keep that one
            host.innerHTML = svg;
        }
    } catch (e) {
        console.error(`[${logTag}] diagram failed`, e, code);
        if (latestByHost.get(host) === seq) {
            host.textContent = 'Diagram failed: ' + (e as Error).message;
        }
    }
}
