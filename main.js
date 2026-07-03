
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { store } from './store.js';

/* ============================================================
   SUPABASE INIT
   ============================================================ */
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   UTILITIES
   ============================================================ */
function esc(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtCurrency(n) {
  if (n == null) return '—';
  return '₹' + Number(n).toLocaleString('en-IN');
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* Toast */
function toast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${esc(msg)}</span>`;
  c.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

/* Modal */
function showModal(title, bodyHtml, size = '') {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'dynamic-modal';
  overlay.innerHTML = `
    <div class="modal ${size}">
      <button class="modal-close" data-action="close-modal">&times;</button>
      <div class="modal-title">${esc(title)}</div>
      <div class="modal-body">${bodyHtml}</div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('[data-action="close-modal"]')) closeModal();
  });
}
function closeModal() {
  const m = document.getElementById('dynamic-modal');
  if (m) m.remove();
}

/* ============================================================
   CONSTANTS
   ============================================================ */
const ENQ_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const JOB_STATUSES = ['new', 'assigned', 'in_progress', 'collecting', 'verifying', 'approved', 'closed'];
const CASH_STATUSES = ['pending', 'verified', 'approved', 'rejected'];
const SR_STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
const INV_TYPES = ['used', 'replaced', 'damaged'];
const CASH_CATEGORIES = ['installation', 'maintenance', 'equipment', 'salary', 'rental', 'transport', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const ROLES = ['admin', 'manager', 'employee', 'customer'];
const SOURCES = ['website', 'referral', 'walkin', 'phone', 'social'];

const MODULE_MAP = {
  admin: [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'enquiries', icon: 'fa-magnifying-glass', label: 'Enquiries' },
    { id: 'jobs', icon: 'fa-briefcase', label: 'Jobs' },
    { id: 'cashflow', icon: 'fa-money-bill-wave', label: 'Cash Flow' },
    { id: 'service', icon: 'fa-wrench', label: 'Service Requests' },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Inventory' },
    { id: 'users', icon: 'fa-users-gear', label: 'User Management' }
  ],
  manager: [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'enquiries', icon: 'fa-magnifying-glass', label: 'Enquiries' },
    { id: 'jobs', icon: 'fa-briefcase', label: 'Jobs' },
    { id: 'cashflow', icon: 'fa-money-bill-wave', label: 'Cash Flow' },
    { id: 'service', icon: 'fa-wrench', label: 'Service Requests' },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Inventory' }
  ],
  employee: [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'jobs', icon: 'fa-briefcase', label: 'My Jobs' },
    { id: 'service', icon: 'fa-wrench', label: 'Service Requests' },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Inventory Log' }
  ],
  customer: [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'enquiries', icon: 'fa-magnifying-glass', label: 'My Enquiries' },
    { id: 'jobs', icon: 'fa-briefcase', label: 'My Jobs' },
    { id: 'service', icon: 'fa-wrench', label: 'Service Requests' }
  ]
};

const JOB_STEPS = [
  { key: 'new', icon: 'fa-plus', label: 'New' },
  { key: 'assigned', icon: 'fa-user-plus', label: 'Assigned' },
  { key: 'in_progress', icon: 'fa-hammer', label: 'In Progress' },
  { key: 'collecting', icon: 'fa-money-bill', label: 'Collecting' },
  { key: 'verifying', icon: 'fa-check-double', label: 'Verifying' },
  { key: 'approved', icon: 'fa-stamp', label: 'Approved' },
  { key: 'closed', icon: 'fa-flag-checkered', label: 'Closed' }
];

/* ============================================================
   STATUS / BADGE HELPERS
   ============================================================ */
function badgeCls(status) {
  const map = {
    new: 'blue', contacted: 'blue', qualified: 'orange', converted: 'green', lost: 'gray',
    assigned: 'blue', in_progress: 'orange', collecting: 'orange', verifying: 'blue', approved: 'green', closed: 'green',
    pending: 'orange', verified: 'blue', rejected: 'red',
    open: 'blue', resolved: 'green',
    used: 'blue', replaced: 'orange', damaged: 'red',
    low: 'gray', medium: 'blue', high: 'orange', critical: 'red',
    income: 'green', expense: 'red',
    admin: 'red', manager: 'orange', employee: 'blue', customer: 'gray'
  };
  return map[status] || 'gray';
}
function badge(status) {
  return `<span class="badge badge-${badgeCls(status)}">${esc(status)}</span>`;
}
/* ============================================================
   UI COMPONENTS
   ============================================================ */
function statCard({ label, value, icon, color = 'green', sub = '' }) {
  return `<div class="stat-card">
    <div class="stat-info">
      <div class="stat-label">${esc(label)}</div>
      <div class="stat-value">${esc(value)}</div>
      ${sub ? `<div class="stat-sub">${esc(sub)}</div>` : ''}
    </div>
    <div class="stat-icon ${color}"><i class="fa-solid ${icon}"></i></div>
  </div>`;
}

function field({ name, label, type = 'text', value = '', options = [], required = false, placeholder = '' }) {
  const req = required ? 'required' : '';
  const val = value != null ? `value="${esc(String(value))}"` : '';
  if (type === 'select') {
    const opts = options.map(o => {
      const v = typeof o === 'object' ? o.value : o;
      const l = typeof o === 'object' ? o.label : o;
      const sel = String(v) === String(value) ? 'selected' : '';
      return `<option value="${esc(v)}" ${sel}>${esc(l)}</option>`;
    }).join('');
    return `<div class="form-group"><label>${esc(label)}</label><select name="${esc(name)}" ${req}><option value="">Select...</option>${opts}</select></div>`;
  }
  if (type === 'textarea') {
    return `<div class="form-group"><label>${esc(label)}</label><textarea name="${esc(name)}" rows="3" ${req} placeholder="${esc(placeholder)}">${esc(value)}</textarea></div>`;
  }
  return `<div class="form-group"><label>${esc(label)}</label><input type="${type}" name="${esc(name)}" ${val} ${req} placeholder="${esc(placeholder)}"></div>`;
}

function dataTable({ cols, rows, actions, empty = 'No records found' }) {
  if (!rows || !rows.length) {
    return `<div class="empty-state"><i class="fa-solid fa-inbox"></i><h3>Nothing here</h3><p>${esc(empty)}</p></div>`;
  }
  let h = '<div class="table-wrap"><table><thead><tr>';
  cols.forEach(c => { h += `<th>${esc(c.label)}</th>`; });
  if (actions) h += '<th>Actions</th>';
  h += '</tr></thead><tbody>';
  rows.forEach(r => {
    h += '<tr>';
    cols.forEach(c => { h += `<td>${c.render ? c.render(r) : esc(r[c.key])}</td>`; });
    if (actions) h += `<td><div class="table-actions">${actions(r)}</div></td>`;
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

function jobStepper(status) {
  const idx = JOB_STATUSES.indexOf(status);
  return `<div class="stepper">${JOB_STEPS.map((s, i) => {
    let cls = 'step';
    if (i < idx) cls += ' completed';
    else if (i === idx) cls += ' active';
    const line = i < JOB_STEPS.length - 1 ? `<div class="step-line${i < idx ? ' done' : ''}"></div>` : '';
    return `<div class="${cls}"><div class="step-icon"><i class="fa-solid ${s.icon}"></i></div><div class="step-label">${s.label}</div></div>${line}`;
  }).join('')}</div>`;
}

/* ============================================================
   AUTH
   ============================================================ */
async function handleLogin(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { toast(error.message, 'error'); return; }
  toast('Logged in successfully');
}

async function handleRegister(data) {
  const { data: authData, error } = await sb.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.full_name, phone: data.phone || '', role: 'customer' } }
  });
  if (error) { toast(error.message, 'error'); return; }
  toast('Account created. Please check your email to verify.', 'info');
  document.getElementById('login-form').reset();
  document.getElementById('register-form').reset();
  switchTab('login');
}

async function handleLogout() {
  await sb.auth.signOut();
  store.setState({ user: null, profile: null, module: 'dashboard', itemId: null, enquiries: [], jobs: [], cashEntries: [], serviceRequests: [], inventoryLogs: [], profiles: [] });
  toast('Logged out', 'info');
}
/* ============================================================
   DATA LAYER
   ============================================================ */
async function fetchProfile(userId) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error) { console.error('Profile fetch error', error); return null; }
  return data;
}

async function fetchAllData() {
  store.setState({ loading: true });
  const { profile } = store.getState();
  const role = profile?.role;
  try {
    const [eqRes, jobRes, cashRes, srRes, invRes, profRes] = await Promise.all([
      sb.from('enquiries').select('*').order('created_at', { ascending: false }),
      sb.from('jobs').select('*').order('created_at', { ascending: false }),
      sb.from('cash_entries').select('*').order('created_at', { ascending: false }),
      sb.from('service_requests').select('*').order('created_at', { ascending: false }),
      sb.from('inventory_logs').select('*').order('created_at', { ascending: false }),
      role === 'admin' || role === 'manager' ? sb.from('profiles').select('*').order('created_at', { ascending: false }) : Promise.resolve([])
    ]);
    store.setState({
      enquiries: eqRes.data || [],
      jobs: jobRes.data || [],
      cashEntries: cashRes.data || [],
      serviceRequests: srRes.data || [],
      inventoryLogs: invRes.data || [],
      profiles: profRes.data || [],
      loading: false
    });
  } catch (err) {
    console.error(err);
    store.setState({ loading: false });
    toast('Failed to load data', 'error');
  }
}

/* ============================================================
   CRUD OPERATIONS
   ============================================================ */
async function createEnquiry(data) {
  const { error } = await sb.from('enquiries').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Enquiry created'); return true;
}
async function updateEnquiry(id, data) {
  const { error } = await sb.from('enquiries').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Enquiry updated'); return true;
}
async function deleteEnquiry(id) {
  const { error } = await sb.from('enquiries').delete().eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Enquiry deleted'); return true;
}

async function createJob(data) {
  const { error } = await sb.from('jobs').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Job created'); return true;
}
async function updateJob(id, data) {
  const { error } = await sb.from('jobs').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Job updated'); return true;
}

async function createCashEntry(data) {
  const { error } = await sb.from('cash_entries').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Cash entry created'); return true;
}
async function updateCashEntry(id, data) {
  const { error } = await sb.from('cash_entries').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Cash entry updated'); return true;
}

async function createServiceRequest(data) {
  const { error } = await sb.from('service_requests').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Service request created'); return true;
}
async function updateServiceRequest(id, data) {
  const { error } = await sb.from('service_requests').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Service request updated'); return true;
}

async function createInventoryLog(data) {
  const { error } = await sb.from('inventory_logs').insert(data);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Inventory logged'); return true;
}
async function updateProfile(id, data) {
  const { error } = await sb.from('profiles').update(data).eq('id', id);
  if (error) { toast(error.message, 'error'); return false; }
  toast('Profile updated'); return true;
}

/* ============================================================
   WORKFLOW
   ============================================================ */
async function convertToJob(enqId) {
  const { enquiries, profile } = store.getState();
  const enq = enquiries.find(e => e.id === enqId);
  if (!enq) return;
  const jobData = {
    enquiry_id: enqId,
    customer_name: enq.customer_name,
    customer_phone: enq.customer_phone,
    customer_email: enq.customer_email,
    address: enq.address,
    description: enq.requirements,
    status: 'new',
    created_by: profile.id
  };
  const ok = await createJob(jobData);
  if (ok) {
    await updateEnquiry(enqId, { status: 'converted' });
    await fetchAllData();
    closeModal();
  }
}

async function advanceJob(jobId, newStatus, extra = {}) {
  const ok = await updateJob(jobId, { status: newStatus, ...extra });
  if (ok) { await fetchAllData(); closeModal(); }
}

async function collectPayment(jobId) {
  const form = document.querySelector('[data-form="collect-payment"]');
  if (!form) return;
  const fd = new FormData(form);
  const amount = parseFloat(fd.get('amount'));
  if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
  const { profile } = store.getState();
  const ok = await createCashEntry({
    job_id: jobId,
    amount,
    type: 'income',
    category: 'installation',
    description: fd.get('description') || 'Payment collected',
    collected_by: profile.id,
    status: 'pending'
  });
  if (ok) {
    await advanceJob(jobId, 'verifying');
  }
}

async function verifyJob(jobId) {
  const { profile, jobs } = store.getState();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;
  /* Verify associated cash entries */
  const { cashEntries } = store.getState();
  const related = cashEntries.filter(c => c.job_id === jobId && c.status === 'pending');
  for (const ce of related) {
    await updateCashEntry(ce.id, { verified_by: profile.id, status: 'verified' });
  }
  await advanceJob(jobId, 'approved');
}

async function approveJob(jobId) {
  const { profile, jobs, cashEntries } = store.getState();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;
  const related = cashEntries.filter(c => c.job_id === jobId && c.status === 'verified');
  for (const ce of related) {
    await updateCashEntry(ce.id, { approved_by: profile.id, status: 'approved' });
  }
  await advanceJob(jobId, 'closed', { completed_date: new Date().toISOString() });
}

/* Service Requests */
    if (action === 'create-sr') {
      showModal('New Service Request', `<form data-form="sr">${srFormHtml()}</form>`, 'modal-lg');
      return;
    }
    if (action === 'view-sr') {
      showModal('Service Request Details', viewSrHtml(id), 'modal-lg');
      return;
    }
    if (action === 'assign-sr') {
      const { profiles } = store.getState();
      const sr = store.getState().serviceRequests.find(s => s.id === id);
      const employees = profiles.filter(p => ['employee', 'manager'].includes(p.role));
      showModal('Assign Service Request', `<form data-form="assign-sr">
        <input type="hidden" name="id" value="${id}">
        ${field({ name: 'assigned_to', label: 'Assign To', type: 'select', value: sr?.assigned_to, options: employees.map(e => ({ value: e.id, label: e.full_name })), required: true })}
        <button type="submit" class="btn btn-accent btn-block" style="margin-top:12px">Assign</button>
      </form>`);
      return;
    }
    if (action === 'start-sr') {
      await updateServiceRequest(id, { status: 'in_progress' });
      await fetchAllData();
      closeModal();
      return;
    }
    if (action === 'resolve-sr') {
      await updateServiceRequest(id, { status: 'resolved', resolved_at: new Date().toISOString() });
      await fetchAllData();
      closeModal();
      return;
    }
    if (action === 'close-sr') {
      await updateServiceRequest(id, { status: 'closed' });
      await fetchAllData();
      closeModal();
      return;
    }

    /* Inventory */
    if (action === 'create-inventory') {
      showModal('Log Inventory', `<form data-form="inventory">${inventoryFormHtml()}</form>`, 'modal-lg');
      return;
    }
    if (action === 'log-inventory') {
      showModal('Log Inventory', `<form data-form="inventory">${inventoryFormHtml(id)}</form>`, 'modal-lg');
      return;
    }

    /* Users */
    if (action === 'edit-user') {
      const user = store.getState().profiles.find(p => p.id === id);
      if (user) showModal('Edit User', `<form data-form="user-edit"><input type="hidden" name="id" value="${user.id}">${userFormHtml(user)}</form>`);
      return;
    }
  });

  /* Form submissions inside modals */
  document.body.addEventListener('submit', async e => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const fd = new FormData(form);
    const formType = form.dataset.form;
    const { profile } = store.getState();

    if (formType === 'enquiry') {
      const ok = await createEnquiry({
        customer_name: fd.get('customer_name'), customer_email: fd.get('customer_email'),
        customer_phone: fd.get('customer_phone'), address: fd.get('address'),
        requirements: fd.get('requirements'), source: fd.get('source'),
        status: 'new', notes: fd.get('notes'), created_by: profile.id
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'enquiry-edit') {
      const id = fd.get('id');
      const ok = await updateEnquiry(id, {
        customer_name: fd.get('customer_name'), customer_email: fd.get('customer_email'),
        customer_phone: fd.get('customer_phone'), address: fd.get('address'),
        requirements: fd.get('requirements'), source: fd.get('source'),
        status: fd.get('status'), notes: fd.get('notes')
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'job') {
      const ok = await createJob({
        customer_name: fd.get('customer_name'), customer_phone: fd.get('customer_phone'),
        customer_email: fd.get('customer_email'), address: fd.get('address'),
        description: fd.get('description'), assigned_to: fd.get('assigned_to') || null,
        scheduled_date: fd.get('scheduled_date') || null, status: 'new',
        notes: fd.get('notes'), enquiry_id: fd.get('enquiry_id') || null, created_by: profile.id
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'assign-job') {
      const id = fd.get('id');
      const ok = await updateJob(id, {
        assigned_to: fd.get('assigned_to') || null,
        scheduled_date: fd.get('scheduled_date') || null,
        status: 'assigned'
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'collect-payment') {
      await collectPayment(fd.get('job_id'));
    }
    else if (formType === 'cash') {
      const ok = await createCashEntry({
        job_id: fd.get('job_id') || null, amount: parseFloat(fd.get('amount')),
        type: fd.get('type'), category: fd.get('category'),
        description: fd.get('description'), collected_by: fd.get('collected_by') || profile.id,
        status: 'pending'
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'sr') {
      const ok = await createServiceRequest({
        customer_name: fd.get('customer_name'), customer_phone: fd.get('customer_phone'),
        customer_email: fd.get('customer_email'), address: fd.get('address'),
        amc_number: fd.get('amc_number') || null, priority: fd.get('priority'),
        issue_description: fd.get('issue_description'), status: 'open',
        created_by: fd.get('created_by') || profile.id
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'assign-sr') {
      const id = fd.get('id');
      await updateServiceRequest(id, { assigned_to: fd.get('assigned_to') || null, status: 'assigned' });
      await fetchAllData();
      closeModal();
    }
    else if (formType === 'inventory') {
      const ok = await createInventoryLog({
        job_id: fd.get('job_id'), item_name: fd.get('item_name'),
        quantity: parseInt(fd.get('quantity')) || 1, type: fd.get('type'),
        description: fd.get('description'), logged_by: fd.get('logged_by') || profile.id
      });
      if (ok) { await fetchAllData(); closeModal(); }
    }
    else if (formType === 'user-edit') {
      const id = fd.get('id');
      await updateProfile(id, {
        full_name: fd.get('full_name'), phone: fd.get('phone'), role: fd.get('role')
      });
      await fetchAllData();
      closeModal();
    }
  });
}

function switchTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

function closeSidebarMobile() {
  document.getElementById('sidebar')?.classList.remove('open');
}

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  setupEventListeners();

  /* Listen for auth state changes */
  sb.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      if (profile) {
        store.setState({ user: session.user, profile });
        await fetchAllData();
      } else {
        /* Profile might not exist yet (just registered) */
        store.setState({ user: session.user, profile: null });
      }
    } else {
      store.setState({ user: null, profile: null });
    }
  });

  /* Check existing session */
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    const profile = await fetchProfile(session.user.id);
    if (profile) {
      store.setState({ user: session.user, profile });
      await fetchAllData();
    }
  }

  /* Subscribe to store for rendering */
  store.subscribe(() => render());

  /* Initial render */
  render();
}

init();
