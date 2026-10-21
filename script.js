const WHATSAPP_NUMBER = "23672827610";

const state = {
  direction: "RCA_MA", // RCA_MA = RCA vers Maroc / MA_RCA = Maroc vers RCA
  mode: "send"         // send = J'envoie / receive = Je veux recevoir
};

const el = {
  fromFlag: document.getElementById("fromFlag"),
  fromName: document.getElementById("fromName"),
  toFlag: document.getElementById("toFlag"),
  toName: document.getElementById("toName"),
  switchDirection: document.getElementById("switchDirection"),
  modes: document.querySelectorAll(".mode"),
  amountLabel: document.getElementById("amountLabel"),
  amountInput: document.getElementById("amountInput"),
  inputCurrency: document.getElementById("inputCurrency"),
  currencyIcon: document.getElementById("currencyIcon"),
  hint: document.getElementById("hint"),
  error: document.getElementById("error"),
  resultRows: document.getElementById("resultRows"),
  finalLabel: document.getElementById("finalLabel"),
  finalAmount: document.getElementById("finalAmount"),
  resultIcon: document.getElementById("resultIcon"),
  rateText: document.getElementById("rateText"),
  whatsapp: document.getElementById("whatsapp")
};

function cleanNumber(value) {
  return Number(String(value).replace(/\D/g, ""));
}

function format(value) {
  return Math.round(value).toLocaleString("fr-FR");
}

function money(value, currency) {
  return `${format(value)} ${currency}`;
}

function animateResult() {
  const card = document.getElementById("resultCard");
  card.classList.remove("pop");
  void card.offsetWidth;
  card.classList.add("pop");
}

function rows(items) {
  el.resultRows.innerHTML = items.map(item => `
    <div class="row">
      <span>${item.label}</span>
      <strong class="${item.className || ""}">${item.value}</strong>
    </div>
  `).join("");
  if (items.length) animateResult();
}

function setWhatsapp(message) {
  el.whatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  el.whatsapp.classList.remove("disabled");
}

function disableWhatsapp() {
  el.whatsapp.href = "#";
  el.whatsapp.classList.add("disabled");
}

function calculateRcaToMorocco(amount) {
  if (state.mode === "send") {
    if (amount < 5000) throw new Error("Le montant minimum est de 5 000 FCFA.");

    const receivedMad = amount * 0.015;

    rows([
      { label: "💵 Montant envoyé", value: money(amount, "FCFA") },
      { label: "📈 Taux appliqué", value: "1 FCFA = 0.015 MAD" }
    ]);

    el.finalLabel.textContent = "Le bénéficiaire recevra au Maroc";
    el.finalAmount.textContent = money(receivedMad, "DH");

    setWhatsapp(`Bonjour TOKWA EXPRESS.
Je souhaite effectuer un transfert RCA → Maroc.
J'envoie ${money(amount, "FCFA")}.
Selon la simulation, le bénéficiaire recevra ${money(receivedMad, "DH")}.
Je souhaite poursuivre l'opération.`);
    return;
  }

  if (amount <= 0) throw new Error("Veuillez saisir le montant souhaité en DH.");

  const desiredMad = amount;
  const amountFcfa = desiredMad / 0.015;

  rows([
    { label: "💴 Montant souhaité", value: money(desiredMad, "DH") },
    { label: "📈 Taux appliqué", value: "1 FCFA = 0.015 MAD" }
  ]);

  el.finalLabel.textContent = "Pour recevoir ce montant, vous envoyez";
  el.finalAmount.textContent = money(amountFcfa, "FCFA");

  setWhatsapp(`Bonjour TOKWA EXPRESS.
Je souhaite effectuer un transfert RCA → Maroc.
Je veux que le bénéficiaire reçoive ${money(desiredMad, "DH")}.
Selon la simulation, je dois envoyer ${money(amountFcfa, "FCFA")}.
Je souhaite poursuivre l'opération.`);
}

function calculateMoroccoToRca(amount) {
  const BASE_RATE = 61; // 1 MAD = 61 FCFA
  const BONUS_RATE = 0.02; // 2% de prime offerte

  if (state.mode === "send") {
    if (amount <= 0) throw new Error("Veuillez saisir le montant remis au Maroc.");

    const convertedFcfa = amount * BASE_RATE;
    const bonusFcfa = convertedFcfa * BONUS_RATE;
    const totalFcfa = convertedFcfa + bonusFcfa;

    rows([
      { label: "💴 Montant remis", value: money(amount, "MAD") },
      { label: "💵 Montant converti", value: money(convertedFcfa, "FCFA") },
      { label: "🎁 Prime Tokwa Express", value: `+${format(bonusFcfa)} FCFA`, className: "positive" },
      { label: "📈 Taux appliqué", value: "1 MAD = 61 FCFA" }
    ]);

    el.finalLabel.textContent = "Le bénéficiaire recevra en RCA";
    el.finalAmount.textContent = money(totalFcfa, "FCFA");

    setWhatsapp(`Bonjour TOKWA EXPRESS.
Je souhaite effectuer un transfert Maroc → RCA.
Je remets ${money(amount, "MAD")}.
Selon la simulation, le bénéficiaire recevra ${money(totalFcfa, "FCFA")} (avec la prime incluse).
Je souhaite poursuivre l'opération.`);
    return;
  }

  if (amount < 5000) throw new Error("Le montant souhaité doit être au minimum de 5 000 FCFA.");

  const totalFcfa = amount;
  const convertedFcfa = totalFcfa / (1 + BONUS_RATE);
  const bonusFcfa = totalFcfa - convertedFcfa;
  const amountMad = convertedFcfa / BASE_RATE;

  rows([
    { label: "💵 Montant souhaité", value: money(amount, "FCFA") },
    { label: "💵 Montant converti", value: money(convertedFcfa, "FCFA") },
    { label: "🎁 Prime Tokwa Express", value: `+${format(bonusFcfa)} FCFA`, className: "positive" },
    { label: "📈 Taux appliqué", value: "1 MAD = 61 FCFA" }
  ]);

  el.finalLabel.textContent = "Montant à remettre au Maroc";
  el.finalAmount.textContent = money(amountMad, "MAD");

  setWhatsapp(`Bonjour TOKWA EXPRESS.
Je souhaite effectuer un transfert Maroc → RCA.
Je veux que le bénéficiaire reçoive ${money(amount, "FCFA")}.
Selon la simulation, je dois remettre ${money(amountMad, "MAD")} au Maroc.
Je souhaite poursuivre l'opération.`);
}

function calculate() {
  const amount = cleanNumber(el.amountInput.value);
  el.error.textContent = "";
  disableWhatsapp();

  if (!amount) {
    rows([]);
    el.finalAmount.textContent = state.direction === "RCA_MA" ? "0 DH" : "0 FCFA";
    return;
  }

  try {
    if (state.direction === "RCA_MA") calculateRcaToMorocco(amount);
    else calculateMoroccoToRca(amount);
  } catch (e) {
    el.error.textContent = e.message;
  }
}

function updateUI() {
  const isRcaMa = state.direction === "RCA_MA";
  const isSend = state.mode === "send";

  el.fromFlag.src = isRcaMa ? "flag-rca.svg" : "flag-morocco.svg";
  el.fromFlag.alt = isRcaMa ? "Drapeau de la RCA" : "Drapeau du Maroc";
  el.fromName.textContent = isRcaMa ? "RCA" : "Maroc";
  el.toFlag.src = isRcaMa ? "flag-morocco.svg" : "flag-rca.svg";
  el.toFlag.alt = isRcaMa ? "Drapeau du Maroc" : "Drapeau de la RCA";
  el.toName.textContent = isRcaMa ? "Maroc" : "RCA";
  el.resultIcon.textContent = "📋";
  
  el.rateText.textContent = isRcaMa 
    ? "Taux Appliqué : 1 FCFA = 0.015 MAD" 
    : "Taux Appliqué : 1 MAD = 61 FCFA (Prime de 2% offerte)";

  if (isRcaMa && isSend) {
    el.amountLabel.textContent = "Montant envoyé (FCFA)";
    el.inputCurrency.textContent = "FCFA";
    el.currencyIcon.textContent = "💵";
    el.amountInput.placeholder = "Ex : 300 000";
    el.hint.textContent = "Transferts d'argent rapide et sécurisés.";
  } else if (isRcaMa && !isSend) {
    el.amountLabel.textContent = "Montant que le bénéficiaire doit recevoir (DH)";
    el.inputCurrency.textContent = "DH";
    el.currencyIcon.textContent = "💴";
    el.amountInput.placeholder = "Ex : 4 500";
    el.hint.textContent = "Le simulateur calcule le montant FCFA à envoyer.";
  } else if (!isRcaMa && isSend) {
    el.amountLabel.textContent = "Montant remis au Maroc (MAD)";
    el.inputCurrency.textContent = "MAD";
    el.currencyIcon.textContent = "💴";
    el.amountInput.placeholder = "Ex : 10 000";
    el.hint.textContent = "Une Prime Tokwa Express est ajoutée au montant reçu en RCA.";
  } else {
    el.amountLabel.textContent = "Montant souhaité en RCA (FCFA)";
    el.inputCurrency.textContent = "FCFA";
    el.currencyIcon.textContent = "💵";
    el.amountInput.placeholder = "Ex : 618 300";
    el.hint.textContent = "Calcul du montant MAD à remettre au Maroc.";
  }

  el.amountInput.value = "";
  el.error.textContent = "";
  rows([]);
  el.finalLabel.textContent = isRcaMa ? "Le bénéficiaire recevra au Maroc" : "Le bénéficiaire recevra en RCA";
  el.finalAmount.textContent = isRcaMa ? "0 DH" : "0 FCFA";
  disableWhatsapp();
}

el.amountInput.addEventListener("input", () => {
  const cleaned = cleanNumber(el.amountInput.value);
  el.amountInput.value = cleaned ? format(cleaned) : "";
  calculate();
});

el.switchDirection.addEventListener("click", () => {
  state.direction = state.direction === "RCA_MA" ? "MA_RCA" : "RCA_MA";
  document.querySelector(".direction-card").classList.add("switching");
  setTimeout(() => document.querySelector(".direction-card").classList.remove("switching"), 280);
  updateUI();
});

el.modes.forEach(button => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    el.modes.forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    updateUI();
  });
});

updateUI();
