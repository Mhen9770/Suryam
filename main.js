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
