const resultEl = document.getElementById('result');
const smallEl = document.getElementById('smallResult');
const pad = document.querySelector('.pad');

let left = '';      // 左オペランド (文字列)
let right = '';     // 右オペランド
let operator = null; // 現在の演算子
let finished = false;
const MAX_LEN = 12;

function render() {
	resultEl.textContent = (left === '' ? '0' : (operator && right ? right : (finished ? left : left)));
	smallEl.textContent = buildExpression();
}

function buildExpression() {
	if (!operator) return '';
	return `${left} ${operator} ${right}`;
}

function clearAll() {
	left = ''; right = ''; operator = null; finished = false;
	render();
}

function backspace() {
	if (finished) { clearAll(); return; }
	if (right) {
		right = right.slice(0, -1);
	} else if (operator) {
		operator = null;
	} else {
		left = left.slice(0, -1);
	}
	render();
}

function appendDigit(target, d) {
	// 先頭の "0" を扱う
	if (d === '.' && target.includes('.')) return target; // 2個目の小数点は無視
	if (target.length >= MAX_LEN) return target;
	// prevent leading zeros like "00"
	if (target === '0' && d !== '.') target = d;
	else target = target + d;
	return target;
}

function handleNum(d) {
	if (finished) { left = ''; finished = false; }
	if (!operator) {
		left = appendDigit(left || '', d);
	} else {
		right = appendDigit(right || '', d);
	}
	render();
}

function handleOp(op) {
	if (!left) return; // 演算子は左辺が必要
	if (right) {
		// すでに右がある場合は先に計算して連鎖させる
		const res = compute(left, right, operator);
		if (res === null) { showError(); return; }
		left = res;
		right = '';
		operator = op;
		finished = false;
	} else {
		operator = op;
	}
	render();
}

function compute(aStr, bStr, op) {
	const a = parseFloat(aStr);
	const b = parseFloat(bStr);
	if (isNaN(a) || isNaN(b)) return null;
	let r;
	switch (op) {
		case '+': r = a + b; break;
		case '-': r = a - b; break;
		case '*': r = a * b; break;
		case '/':
			if (b === 0) return null;
			r = a / b;
			break;
		default: return null;
	}
	// 表示整形: 必要なら小数点以下3桁に丸めるが基本は短くする
	let s = String(r);
	if (s.includes('.')) {
		// 有効桁数を制限して末尾の 0 を除去
		s = parseFloat(r.toFixed(6)).toString();
	}
	// 長すぎる場合は指数表記にする
	if (s.length > MAX_LEN) s = Number(r).toExponential(6);
	return s;
}

function doEquals() {
	if (!left) return;
	if (!right && operator) {
		// 単項演算 (x op) = x op x のように扱う
		right = left;
	}
	if (left && operator && right) {
		const res = compute(left, right, operator);
		if (res === null) { showError(); return; }
		left = res;
		right = '';
		operator = null;
		finished = true;
		render();
	}
}

function showError() {
	resultEl.textContent = 'Error';
	smallEl.textContent = '';
	setTimeout(clearAll, 1200);
}

// イベントデリゲーション
pad.addEventListener('click', (e) => {
	const b = e.target.closest('button');
	if (!b) return;
	if (b.dataset.num !== undefined) {
		handleNum(b.dataset.num);
		return;
	}
	if (b.dataset.op !== undefined) {
		handleOp(b.dataset.op);
		return;
	}
	if (b.dataset.action) {
		switch (b.dataset.action) {
			case 'clear': clearAll(); break;
			case 'back': backspace(); break;
			case 'equals': doEquals(); break;
			case 'percent':
				// パーセント処理: 現在の入力に対して %
				if (right) { right = String(parseFloat(right) / 100); }
				else if (left) { left = String(parseFloat(left) / 100); }
				render();
				break;
		}
	}
});

// キーボード操作
document.addEventListener('keydown', (e) => {
	// 数字・テンキー
	if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
		e.preventDefault();
		handleNum(e.key);
		return;
	}
	if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
	if (e.key === 'Escape') { clearAll(); return; }
	if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); doEquals(); return; }
	if (['+','-','*','/'].includes(e.key)) { e.preventDefault(); handleOp(e.key); return; }
});

// 初期表示
clearAll();
