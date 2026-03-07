interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  required?: boolean;
}

const collectionFields: Record<string, FieldConfig[]> = {
  experiences: [
    { name: 'title', label: 'Cargo', type: 'text', required: true },
    { name: 'company', label: 'Empresa', type: 'text', required: true },
    { name: 'startDate', label: 'Fecha inicio (YYYY-MM)', type: 'text', required: true },
    { name: 'endDate', label: 'Fecha fin (YYYY-MM)', type: 'text' },
    { name: 'order', label: 'Orden', type: 'number' },
    { name: 'boss', label: 'Jefe', type: 'text' },
    { name: 'bossPhone', label: 'Teléfono jefe', type: 'text' },
    { name: 'content', label: 'Descripción (Markdown)', type: 'textarea', required: true },
  ],
  formations: [
    { name: 'degree', label: 'Título', type: 'text', required: true },
    { name: 'institute', label: 'Institución', type: 'text', required: true },
    { name: 'location', label: 'Ciudad', type: 'text' },
    { name: 'startDate', label: 'Fecha inicio (YYYY-MM)', type: 'text', required: true },
    { name: 'endDate', label: 'Fecha fin (YYYY-MM)', type: 'text' },
    { name: 'order', label: 'Orden', type: 'number' },
  ],
  skills: [
    { name: 'name', label: 'Nombre interno', type: 'text', required: true },
    { name: 'label', label: 'Etiqueta visible', type: 'text', required: true },
    { name: 'level', label: 'Nivel (0-100)', type: 'number', required: true },
    { name: 'order', label: 'Orden', type: 'number' },
  ],
};

const modalOverlay = document.getElementById('modal-overlay')!;
const modalTitle = document.getElementById('modal-title')!;
const modalFields = document.getElementById('modal-fields')!;
const modalForm = document.getElementById('modal-form')! as HTMLFormElement;
const modalCancel = document.getElementById('modal-cancel')!;

let currentAction: { method: string; url: string } | null = null;

function openModal(title: string, fields: FieldConfig[], values: Record<string, string> = {}, action: { method: string; url: string }): void {
  modalTitle.textContent = title;
  modalFields.innerHTML = '';
  currentAction = action;

  fields.forEach((field) => {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = field.label;
    label.htmlFor = `field-${field.name}`;
    group.appendChild(label);

    if (field.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.name = field.name;
      textarea.id = `field-${field.name}`;
      textarea.value = values[field.name] || '';
      if (field.required) textarea.required = true;
      group.appendChild(textarea);
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      input.id = `field-${field.name}`;
      input.value = values[field.name] || '';
      if (field.required) input.required = true;
      group.appendChild(input);
    }

    modalFields.appendChild(group);
  });

  modalOverlay.classList.add('open');
}

function closeModal(): void {
  modalOverlay.classList.remove('open');
  currentAction = null;
}

modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

modalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentAction) return;

  const formData = new FormData(modalForm);
  const data: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    const field = Object.values(collectionFields).flat().find((f) => f.name === key);
    if (field?.type === 'number') {
      data[key] = parseInt(value as string) || 0;
    } else {
      data[key] = value;
    }
  });

  try {
    const res = await fetch(currentAction.url, {
      method: currentAction.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      closeModal();
      window.location.reload();
    } else {
      const err = await res.json();
      alert(`Error: ${JSON.stringify(err.error)}`);
    }
  } catch {
    alert('Error de red');
  }
});

document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const collection = btn.dataset.add!;
    const fields = collectionFields[collection];
    if (!fields) return;
    openModal(`Agregar ${collection}`, fields, {}, {
      method: 'POST',
      url: `/api/content/${collection}`,
    });
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const collection = btn.dataset.edit!;
    const slug = btn.dataset.slug!;
    const fields = collectionFields[collection];
    if (!fields) return;

    const res = await fetch(`/api/content/${collection}/${slug}`);
    if (!res.ok) return;
    const data = await res.json();

    const values: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.name === 'content') {
        values[f.name] = data.body || '';
      } else {
        values[f.name] = String(data[f.name] ?? '');
      }
    });

    openModal(`Editar ${slug}`, fields, values, {
      method: 'PUT',
      url: `/api/content/${collection}/${slug}`,
    });
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const collection = btn.dataset.delete!;
    const slug = btn.dataset.slug!;

    if (!confirm(`¿Eliminar ${slug}?`)) return;

    const res = await fetch(`/api/content/${collection}/${slug}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert('Error al eliminar');
    }
  });
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  window.location.href = '/';
});
