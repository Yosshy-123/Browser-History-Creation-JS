const resultEl = document.getElementById('result');
const smallEl = document.getElementById('smallResult');
const pad = document.querySelector('.pad');
let left = '';
let right = '';
let operator = null;
let finished = !1;
const MAX_LEN = 12;

function stripTrailingDot(s) {
	if (!s) return s;
	return s.endsWith('.') ? s.slice(0, -1) : s
}

function render() {
	const dispLeft = stripTrailingDot(left);
	resultEl.textContent = (dispLeft === '' ? '0' : (operator && right ? right : (finished ? dispLeft : dispLeft)));
	smallEl.textContent = buildExpression()
}

function buildExpression() {
	if (!operator) return '';
	return `${stripTrailingDot(left)} ${operator} ${stripTrailingDot(right)}`
}

function clearAll() {
	left = '';
	right = '';
	operator = null;
	finished = !1;
	render()
}

function backspace() {
	if (finished) {
		clearAll();
		return
	}
	if (right) {
		right = right.slice(0, -1)
	} else if (operator) {
		operator = null
	} else {
		left = left.slice(0, -1)
	}
	render()
}

function appendDigit(target, d) {
	if (d === '.' && target.includes('.')) return target;
	if (target.length >= MAX_LEN) return target;
	if (d === '.') {
		if (target === '') return '0.';
		return target + d
	}
	if (target === '0' && d !== '.') target = d;
	else target = target + d;
	return target
}

function handleNum(d) {
	if (finished) {
		left = '';
		finished = !1
	}
	if (!operator) {
		left = appendDigit(left || '', d)
	} else {
		right = appendDigit(right || '', d)
	}
	render()
}

function handleOp(op) {
	if (!left) {
		if (op === '-') {
			left = '0';
			operator = op;
			render()
		}
		return
	}
	left = stripTrailingDot(left);
	if (right) right = stripTrailingDot(right);
	if (right) {
		const res = compute(left, right, operator);
		if (res === null) {
			showError();
			return
		}
		left = res;
		right = '';
		operator = op;
		finished = !1
	} else {
		operator = op
	}
	render()
}

function compute(aStr, bStr, op) {
	const a = parseFloat(aStr);
	const b = parseFloat(bStr);
	if (isNaN(a) || isNaN(b)) return null;
	let r;
	switch (op) {
		case '+':
			r = a + b;
			break;
		case '-':
			r = a - b;
			break;
		case '*':
			r = a * b;
			break;
		case '/':
			if (b === 0) return null;
			r = a / b;
			break;
		default:
			return null
	}
	let s = String(r);
	if (s.includes('.')) {
		s = parseFloat(r.toFixed(6)).toString()
	}
	if (s.length > MAX_LEN) s = Number(r).toExponential(6);
	return s
}

function doEquals() {
	if (!left) return;
	left = stripTrailingDot(left);
	if (!right && operator) {
		right = left
	}
	if (right) right = stripTrailingDot(right);
	if (left && operator && right) {
		const res = compute(left, right, operator);
		if (res === null) {
			showError();
			return
		}
		left = res;
		right = '';
		operator = null;
		finished = !0;
		render()
	}
}

function showError() {
	resultEl.textContent = 'Error';
	smallEl.textContent = '';
	setTimeout(clearAll, 1200)
}
pad.addEventListener('click', (e) => {
	const b = e.target.closest('button');
	if (!b) return;
	if (b.dataset.num !== undefined) {
		handleNum(b.dataset.num);
		return
	}
	if (b.dataset.op !== undefined) {
		handleOp(b.dataset.op);
		return
	}
	if (b.dataset.action) {
		switch (b.dataset.action) {
			case 'clear':
				clearAll();
				break;
			case 'back':
				backspace();
				break;
			case 'equals':
				doEquals();
				break;
			case 'percent':
				if (right) {
					right = String(parseFloat(right) / 100)
				} else if (left) {
					left = String(parseFloat(left) / 100)
				}
				render();
				break
		}
	}
});
document.addEventListener('keydown', (e) => {
	if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
		e.preventDefault();
		handleNum(e.key);
		return
	}
	if (e.key === 'Backspace') {
		e.preventDefault();
		backspace();
		return
	}
	if (e.key === 'Escape') {
		clearAll();
		return
	}
	if (e.key === 'Enter' || e.key === '=') {
		e.preventDefault();
		doEquals();
		return
	}
	if (['+', '-', '*', '/'].includes(e.key)) {
		e.preventDefault();
		handleOp(e.key);
		return
	}
});
clearAll()
