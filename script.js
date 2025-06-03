let fullData = [];
let currentPage = 1;
const pageSize = 20;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadGuavaData();
  document.getElementById('guavaForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('yearSelect').addEventListener('change', filterData);
  document.getElementById('monthSelect').addEventListener('change', filterData);
  document.getElementById('dateSelect').addEventListener('change', filterData);
});

async function loadGuavaData() {
  const res = await fetch('/api/guava');
  fullData = await res.json();
  populateDateSelectors(fullData);
  renderTable(fullData);
}

function populateDateSelectors(data) {
  const years = new Set();
  const months = new Set();
  const dates = new Set();

  data.forEach(row => {
    const [y, m, d] = row.date.split('-');
    years.add(y);
    months.add(`${y}-${m}`);
    dates.add(row.date);
  });

  const yearSelect = document.getElementById('yearSelect');
  const monthSelect = document.getElementById('monthSelect');
  const dateSelect = document.getElementById('dateSelect');

  yearSelect.innerHTML = '<option value="">-- 所有年份 --</option>';
  [...years].sort().forEach(y => yearSelect.innerHTML += `<option value="${y}">${y}</option>`);

  monthSelect.innerHTML = '<option value="">-- 所有月份 --</option>';
  [...months].sort().forEach(m => monthSelect.innerHTML += `<option value="${m}">${m}</option>`);

  dateSelect.innerHTML = '<option value="">-- 所有日期 --</option>';
  [...dates].sort().forEach(d => dateSelect.innerHTML += `<option value="${d}">${d}</option>`);
}

function filterData() {
  const y = document.getElementById('yearSelect').value;
  const m = document.getElementById('monthSelect').value;
  const d = document.getElementById('dateSelect').value;

  let filtered = fullData;

  if (y) filtered = filtered.filter(row => row.date.startsWith(y));
  if (m) filtered = filtered.filter(row => row.date.startsWith(m));
  if (d) filtered = filtered.filter(row => row.date === d);

  renderTable(filtered);
}

function renderTable(data) {
  const tbody = document.querySelector('#guavaTable tbody');
  tbody.innerHTML = '';
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  pageData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.id ?? ''}</td><td>${row.avg_price}</td><td>${row.volume}</td><td>${row.date}</td>`;
    tbody.appendChild(tr);
  });

  renderPagination(data.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.addEventListener('click', () => {
      currentPage = i;
      filterData();
    });
    paginationDiv.appendChild(btn);
  }
}

async function handleFormSubmit(e) {
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  try {
    const res = await fetch('/api/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const msg = await res.text();
    document.getElementById('insertMsg').textContent = msg;
    if (res.ok) {
      form.reset();
      await loadGuavaData();
    }
  } catch (err) {
    document.getElementById('insertMsg').textContent = '送出失敗';
  }
}
