const base = location.href.split('#')[0];

let running = false;
let counter = 0;

const mc = new MessageChannel();
mc.port1.onmessage = () => {
	if (!running) return;
	counter++;
	history.replaceState(null, '', base + '#' + counter);
	mc.port2.postMessage(null);
};

document.addEventListener('keydown', (e) => {
	if (e.key !== '¥') return;
	if (running) return;
	running = true;
	const existing = location.hash.replace('#', '');
	counter = existing ? Number(existing) : 0;
	mc.port2.postMessage(null);
});

window.addEventListener('beforeunload', () => {
	running = false;
});
