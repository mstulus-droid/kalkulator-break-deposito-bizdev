/**
 * DATA MEMO BUNGA
 * Sumber data suku bunga bank berdasarkan tanggal berlaku
 */
const DATA_MEMO_BUNGA = [
    { date: "2025-08-28", rates: { 1: 4.5, 3: 4.75, 6: 5.25, 12: 5.5, 24: 6.5, 36: 7.0, 60: 8.25 } },
    { date: "2023-02-01", rates: { 1: 4.75, 3: 5.0, 6: 5.5, 12: 5.75, 24: 6.75, 36: 7.25, 60: 8.5 } },
    { date: "2021-09-30", rates: { 1: 4.5, 3: 4.75, 6: 5.25, 12: 5.5, 24: 6.5, 36: 7.0, 60: 8.25 } },
    { date: "2021-05-29", rates: { 1: 4.75, 3: 5.0, 6: 5.5, 12: 5.75, 24: 6.75, 36: 7.25, 60: 8.25 } },
    { date: "2021-05-01", rates: { 1: 5.0, 3: 5.25, 6: 5.75, 12: 6.0, 24: 7.0, 36: 7.5, 60: 8.25 } },
    { date: "2021-02-25", rates: { 1: 5.25, 3: 5.5, 6: 5.75, 12: 6.0, 24: 7.0, 36: 7.5, 60: 8.25 } },
    { date: "2021-01-26", rates: { 1: 5.5, 3: 5.75, 6: 6.0, 12: 6.25, 24: 7.25, 36: 7.75, 60: 8.25 } },
    { date: "2020-11-25", rates: { 1: 5.5, 3: 6.0, 6: 6.25, 12: 6.5, 24: 7.25, 36: 7.75, 60: 8.25 } },
    { date: "2020-10-01", rates: { 1: 6.0, 3: 6.5, 6: 6.75, 12: 7.0, 24: 7.75, 36: 8.25, 60: 8.75 } },
    { date: "2020-07-30", rates: { 1: 6.25, 3: 6.75, 6: 7.0, 12: 7.25, 24: 8.0, 36: 8.25, 60: 8.75 } },
    { date: "2020-01-29", rates: { 1: 6.5, 3: 7.0, 6: 7.25, 12: 7.5, 24: 8.0, 36: 8.25, 60: 8.75 } }
];

// State Aplikasi
let currentView = 'calc';
let isReinvest = false;
let reType = 'all';
const AVAILABLE_TENORS = [60, 36, 24, 12, 6, 3, 1];

/**
 * FUNGSI FORMATTING
 */
function formatInput(el) {
    let val = el.value.replace(/\D/g, "");
    el.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatNumber(num) {
    return Math.round(num).toLocaleString('id-ID');
}

function formatRupiah(num) {
    return 'Rp ' + formatNumber(num);
}

function formatDateReadable(date) {
    const d = new Date(date);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('id-ID', options).replace(/\./g, '');
}

/**
 * NAVIGASI & UI TOGGLE
 */
function toggleReinvest() {
    isReinvest = !isReinvest;
    const box = document.getElementById('checkReinvest');
    const opt = document.getElementById('reinvestOptions');
    if (isReinvest) {
        box.classList.replace('bg-slate-50', 'bg-blue-600');
        box.classList.replace('border-slate-200', 'border-blue-600');
        opt.classList.remove('hidden');
    } else {
        box.classList.replace('bg-blue-600', 'bg-slate-50');
        box.classList.replace('border-blue-600', 'border-slate-200');
        opt.classList.add('hidden');
    }
}

function handleReType(type) {
    reType = type;
    document.getElementById('partialInput').classList.toggle('hidden', type !== 'partial');
}

function toggleViewAuto() {
    toggleView(currentView === 'calc' ? 'history' : 'calc');
}

function toggleView(view) {
    currentView = view;
    const calc = document.getElementById('calcView');
    const history = document.getElementById('historyView');
    const navIcon = document.getElementById('navIcon');

    if (view === 'history') {
        calc.classList.add('hidden');
        history.classList.remove('hidden');
        navIcon.className = 'fas fa-calculator';
        renderHistory();
    } else {
        calc.classList.remove('hidden');
        history.classList.add('hidden');
        navIcon.className = 'fas fa-history';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleDetails() {
    const details = document.getElementById('details');
    const btn = document.getElementById('detailToggleBtn');
    details.classList.toggle('hidden');
    
    if (details.classList.contains('hidden')) {
        btn.innerHTML = '<span>Lihat Rincian</span> <i class="fas fa-chevron-down text-[8px]"></i>';
    } else {
        btn.innerHTML = '<span>Tutup Rincian</span> <i class="fas fa-chevron-up text-[8px]"></i>';
        setTimeout(() => {
            details.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }
}

/**
 * LOGIKA PERHITUNGAN (CORE)
 */
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getActiveMemo(date) {
    const sorted = [...DATA_MEMO_BUNGA].sort((a, b) => new Date(b.date) - new Date(a.date));
    const idx = sorted.findIndex(m => new Date(m.date) <= date);
    return idx === -1 ? sorted[sorted.length - 1] : sorted[idx];
}

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function resetApp() {
    document.getElementById('nominal').value = '';
    document.getElementById('tenor').value = '';
    document.getElementById('tglTanam').value = '';
    document.getElementById('nominalReinvest').value = '';
    document.getElementById('resultCard').classList.add('hidden');
    if(isReinvest) toggleReinvest();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function calculate() {
    const nominalStr = document.getElementById('nominal').value;
    const tenorKontrak = document.getElementById('tenor').value;
    const tglTanamStr = document.getElementById('tglTanam').value;
    const tglBreakStr = document.getElementById('tglBreak').value;

    if (!nominalStr || !tenorKontrak || !tglTanamStr) {
        return alert("Mohon lengkapi Nominal, Jangka Waktu Awal, dan Tanggal Tanam!");
    }

    const nominal = parseFloat(nominalStr.replace(/\./g, '')) || 0;
    const startOrig = new Date(tglTanamStr);
    const breakDate = new Date(tglBreakStr);

    if (breakDate <= startOrig) return alert("Tanggal Break tidak boleh sebelum/sama dengan Tanggal Tanam!");

    const totalDays = Math.ceil(Math.abs(breakDate - startOrig) / (1000 * 60 * 60 * 24));
    const masterMemo = getActiveMemo(startOrig);
    const rateKontrak = masterMemo.rates[tenorKontrak] || 0;

    // Set Label Memo
    const sortedMemo = [...DATA_MEMO_BUNGA].sort((a, b) => new Date(b.date) - new Date(a.date));
    const masterIdx = sortedMemo.findIndex(m => m.date === masterMemo.date);
    let memoLabel = `${formatDateReadable(masterMemo.date)} s/d `;
    if (masterIdx === 0) memoLabel += "Sekarang";
    else {
        const nextDate = new Date(sortedMemo[masterIdx - 1].date);
        nextDate.setDate(nextDate.getDate() - 1);
        memoLabel += formatDateReadable(nextDate);
    }
    document.getElementById('detMemo').innerText = memoLabel;

    const divPaid = isLeapYear(startOrig.getFullYear()) ? 366 : 365;
    const bungaPaidTotal = (nominal * (rateKontrak / 100) * totalDays) / divPaid;

    let currentDate = new Date(startOrig);
    let totalBungaSeharusnya = 0;
    let breakdownHtml = "";

    while (true) {
        let monthsRem = (breakDate.getFullYear() - currentDate.getFullYear()) * 12 + (breakDate.getMonth() - currentDate.getMonth());
        if (breakDate.getDate() < currentDate.getDate()) monthsRem--;
        if (monthsRem < 1) break;

        let selectedT = 1;
        for (let t of AVAILABLE_TENORS) {
            if (monthsRem >= t) { selectedT = t; break; }
        }

        const rateAktualBlock = masterMemo.rates[selectedT];
        const blockEndDate = addMonths(currentDate, selectedT);
        const blockDays = Math.ceil(Math.abs(blockEndDate - currentDate) / (1000 * 60 * 60 * 24));
        const divisor = isLeapYear(currentDate.getFullYear()) ? 366 : 365;
        const bungaBlok = (nominal * (rateAktualBlock / 100) * blockDays) / divisor;
        
        totalBungaSeharusnya += bungaBlok;
        let tenorLabel = selectedT >= 12 ? `${selectedT/12} thn` : `${selectedT} bln`;

        breakdownHtml += `
            <tr>
                <td class="leading-tight text-slate-500 font-medium">${formatDateReadable(currentDate)} s/d ${formatDateReadable(blockEndDate)}</td>
                <td class="text-center text-blue-900 font-black">${tenorLabel}</td>
                <td class="text-right text-slate-800 font-black">${formatNumber(bungaBlok)} <span class="text-[7px] text-slate-400 font-bold">(${rateAktualBlock}%)</span></td>
            </tr>
        `;
        currentDate = blockEndDate;
    }

    const remDays = Math.ceil(Math.abs(breakDate - currentDate) / (1000 * 60 * 60 * 24));
    if (remDays > 0) {
        breakdownHtml += `
            <tr class="bg-red-50/10">
                <td class="text-red-400 italic font-medium">${formatDateReadable(currentDate)} s/d ${formatDateReadable(breakDate)}</td>
                <td class="text-center text-red-300 font-black">${remDays} hr</td>
                <td class="text-right text-red-500 font-black">0 <span class="text-[7px] opacity-40">(0%)</span></td>
            </tr>
        `;
    }

    const reversal = Math.max(0, bungaPaidTotal - totalBungaSeharusnya);
    let penalty = 0;
    if (isReinvest) {
        if (reType === 'all') {
            penalty = 0;
            document.getElementById('penaltyLabel').innerText = "Denda Penalty (Ditanam)";
        } else {
            const reNominalStr = document.getElementById('nominalReinvest').value;
            const reNominal = parseFloat(reNominalStr.replace(/\./g, '')) || 0;
            const sisa = Math.max(0, nominal - reNominal);
            penalty = sisa * 0.001;
            document.getElementById('penaltyLabel').innerText = "Denda Penalty (0,1% Sisa)";
        }
    } else {
        penalty = nominal * 0.001;
        document.getElementById('penaltyLabel').innerText = "Denda Penalty (0,1%)";
    }

    const totalReceived = nominal - penalty - reversal;
    const totalBenefit = totalReceived + bungaPaidTotal;

    // Update UI Results
    document.getElementById('resTotal').innerText = formatRupiah(totalReceived);
    document.getElementById('resTotalBenefit').innerHTML = `
        Hasil Investasi Bersih: <span class="text-blue-900 font-black">${formatRupiah(totalBenefit)}</span><br>
        <span class="text-[9px] opacity-70">(Pokok Cair ${formatNumber(totalReceived)} + Bunga Sudah Diterima ${formatNumber(bungaPaidTotal)})</span>
    `;
    
    document.getElementById('resUmur').innerText = `${formatNumber(totalDays)} Hari`;
    document.getElementById('resPenalty').innerText = "-" + formatRupiah(penalty);
    document.getElementById('resReversal').innerText = "-" + formatRupiah(reversal);
    
    document.getElementById('detTableBody').innerHTML = breakdownHtml;
    document.getElementById('detBungaPaid').innerText = formatRupiah(bungaPaidTotal);
    document.getElementById('detBungaSeharusnya').innerText = formatRupiah(totalBungaSeharusnya);
    document.getElementById('detTotalDiff').innerText = formatRupiah(reversal);

    document.getElementById('resultCard').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 150);
}

/**
 * HISTORY VIEW RENDERER
 */
function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';
    const sorted = [...DATA_MEMO_BUNGA].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach((memo, idx) => {
        const tglMulai = formatDateReadable(memo.date);
        let label = (idx === 0) ? `Berlaku ${tglMulai} s/d Sekarang` : `Berlaku ${tglMulai} s/d ${formatDateReadable(new Date(new Date(sorted[idx-1].date).getTime() - 86400000))}`;

        let ratesHtml = '';
        AVAILABLE_TENORS.forEach(t => {
            let tLabel = t >= 12 ? `${t/12} thn` : `${t} bln`;
            ratesHtml += `<div class="bg-white p-2.5 rounded-xl text-center border border-slate-100 shadow-sm"><p class="text-[7px] text-slate-400 font-black uppercase">${tLabel}</p><p class="text-[11px] font-black text-blue-900">${memo.rates[t]}%</p></div>`;
        });

        list.innerHTML += `
            <div class="p-6 bg-white border border-slate-100 rounded-[2rem] space-y-4 shadow-sm text-left">
                <div class="border-b border-slate-50 pb-3"><span class="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em] opacity-40">${label}</span></div>
                <div class="grid grid-cols-4 gap-3">${ratesHtml}</div>
            </div>
        `;
    });
}

// Event saat halaman dimuat
window.onload = () => {
    document.getElementById('tglBreak').value = new Date().toISOString().split('T')[0];
};
