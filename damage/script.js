// 素ダメ計算
function calcBaseDamage(atk) {
  return 0.48 * atk + 29;
}

// 防御逆算
function calcDefense(base, real) {
  return 1068 * (base / real - 1);
}

// 防御レイヤー（最終ダメ計算用）
function calcDamage(base, defense) {
  return base * (1068 / (1068 + defense));
}

document.getElementById("calcBase").addEventListener("click", () => {
  const atk = Number(document.getElementById("atk").value);
  const real = Number(document.getElementById("realDmg").value);

  if (!atk || !real) return;

  const base = calcBaseDamage(atk);
  const defense = calcDefense(base, real);

  const resultArea = document.getElementById("baseResult");
  resultArea.innerHTML = `
    <b>素ダメージ：</b> ${base.toFixed(2)}<br>
    <b>敵の防御力：</b> ${defense.toFixed(0)}<br>
  `;
  resultArea.classList.remove("hidden");

  // バフ／デバフ計算用に保持
  window.__calcValues = { base, defense };
});

document.getElementById("calcBuff").addEventListener("click", () => {
  if (!window.__calcValues) return;

  const { base, defense } = window.__calcValues;

  const atkBuff = Number(document.getElementById("atkBuff").value) || 0;
  const defDebuff = Number(document.getElementById("defDebuff").value) || 0;

  // 防御を下げる
  const newDef = defense * (1 - defDebuff / 100);

  // 基礎ダメに攻撃バフ掛ける
  const buffedBase = base * (1 + atkBuff / 100);

  const finalDmg = calcDamage(buffedBase, newDef);

  const result = document.getElementById("buffResult");
  result.innerHTML = `
    <b>最終ダメージ：</b> ${finalDmg.toFixed(0)}<br><br>

    <small>
      （攻撃バフ：${atkBuff}%、 防御デバフ：${defDebuff}%）<br>
      防御値：${newDef.toFixed(0)}<br>
    </small>
  `;

  result.classList.remove("hidden");
});
