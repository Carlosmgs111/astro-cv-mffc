interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  required?: boolean;
}

const singletonFields: Record<string, FieldConfig[]> = {
  hero: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'title', label: 'Título profesional', type: 'text', required: true },
  ],
  about: [
    { name: 'content', label: 'Acerca de (Markdown)', type: 'textarea', required: true },
  ],
};

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
    { name: 'icon', label: 'Icono (clase FontAwesome)', type: 'text', required: true },
    { name: 'order', label: 'Orden', type: 'number' },
    { name: 'content', label: 'Descripción (Markdown)', type: 'textarea' },
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

  fields.forEach((field, index) => {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.style.animationDelay = `${index * 0.04}s`;
    if (field.required) group.classList.add('form-group--required');

    const label = document.createElement('label');
    label.htmlFor = `field-${field.name}`;
    label.innerHTML = field.required
      ? `${field.label} <span class="form-required">*</span>`
      : field.label;
    group.appendChild(label);

    if (field.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.name = field.name;
      textarea.id = `field-${field.name}`;
      textarea.value = values[field.name] || '';
      textarea.placeholder = `Ingresa ${field.label.toLowerCase()}...`;
      if (field.required) textarea.required = true;
      group.appendChild(textarea);
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      input.id = `field-${field.name}`;
      input.value = values[field.name] || '';
      input.placeholder = field.type === 'number' ? '0' : `Ingresa ${field.label.toLowerCase()}...`;
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
  const allFields = [...Object.values(collectionFields), ...Object.values(singletonFields)].flat();

  formData.forEach((value, key) => {
    const field = allFields.find((f) => f.name === key);
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

document.querySelectorAll<HTMLButtonElement>('[data-edit-singleton]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const name = btn.dataset.editSingleton!;
    const fields = singletonFields[name];
    if (!fields) return;

    const res = await fetch(`/api/content/singleton/${name}`);
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

    const titles: Record<string, string> = {
      hero: 'Editar Perfil',
      about: 'Editar Acerca de',
    };

    openModal(titles[name] || `Editar ${name}`, fields, values, {
      method: 'PUT',
      url: `/api/content/singleton/${name}`,
    });
  });
});

// =================== PHOTO DRAG & DROP ===================

const photoDropzone = document.getElementById('photo-dropzone') as HTMLElement | null;
const photoFileInput = document.getElementById('photo-file-input') as HTMLInputElement | null;
const photoPreviewNew = document.getElementById('photo-preview-new') as HTMLImageElement | null;
const photoNewContainer = document.getElementById('photo-new-container') as HTMLElement | null;
const photoSaveBtn = document.getElementById('photo-save-btn') as HTMLButtonElement | null;
const photoCancelBtn = document.getElementById('photo-cancel-btn') as HTMLButtonElement | null;
const photoDropHint = document.getElementById('photo-drop-hint') as HTMLElement | null;

let pendingPhotoFile: File | null = null;

function showNewPreview(file: File): void {
  if (!photoPreviewNew || !photoNewContainer || !photoSaveBtn || !photoCancelBtn || !photoDropHint) return;
  pendingPhotoFile = file;
  const url = URL.createObjectURL(file);
  photoPreviewNew.src = url;
  photoPreviewNew.onload = () => URL.revokeObjectURL(url);
  photoNewContainer.style.display = 'flex';
  photoSaveBtn.style.display = 'inline-block';
  photoCancelBtn.style.display = 'inline-block';
  photoDropHint.textContent = 'Nueva imagen seleccionada';
}

function resetPhotoUI(): void {
  if (!photoPreviewNew || !photoNewContainer || !photoSaveBtn || !photoCancelBtn || !photoDropHint || !photoFileInput) return;
  pendingPhotoFile = null;
  photoPreviewNew.src = '';
  photoNewContainer.style.display = 'none';
  photoSaveBtn.style.display = 'none';
  photoCancelBtn.style.display = 'none';
  photoDropHint.textContent = 'Arrastra una imagen o haz clic para seleccionar';
  photoFileInput.value = '';
}

if (photoDropzone && photoFileInput) {
  // Click to open file picker
  photoDropzone.addEventListener('click', () => photoFileInput.click());

  // File input change
  photoFileInput.addEventListener('change', () => {
    const file = photoFileInput.files?.[0];
    if (file) showNewPreview(file);
  });

  // Drag events
  photoDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoDropzone.classList.add('dragover');
  });

  photoDropzone.addEventListener('dragleave', () => {
    photoDropzone.classList.remove('dragover');
  });

  photoDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    photoDropzone.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      showNewPreview(file);
    }
  });
}

// Cancel new photo
photoCancelBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  resetPhotoUI();
});

// Save new photo
photoSaveBtn?.addEventListener('click', async (e) => {
  e.stopPropagation();
  if (!pendingPhotoFile) return;

  photoSaveBtn!.textContent = 'Subiendo...';
  photoSaveBtn!.disabled = true;

  try {
    // Upload file
    const uploadData = new FormData();
    uploadData.append('file', pendingPhotoFile);
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
    if (!uploadRes.ok) {
      const errBody = await uploadRes.json().catch(() => ({}));
      throw new Error(errBody.detail || errBody.error || `Upload failed (${uploadRes.status})`);
    }
    const { path: newPath } = await uploadRes.json();

    // Fetch current hero data to preserve name/title
    const heroRes = await fetch('/api/content/singleton/hero');
    if (!heroRes.ok) throw new Error('Failed to fetch hero');
    const heroData = await heroRes.json();

    // Update hero with new photo
    const updateRes = await fetch('/api/content/singleton/hero', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: heroData.name,
        title: heroData.title,
        photo: newPath,
        content: heroData.body || '',
      }),
    });

    if (updateRes.ok) {
      window.location.reload();
    } else {
      const err = await updateRes.json();
      alert(`Error: ${JSON.stringify(err.error)}`);
    }
  } catch (err: any) {
    alert(`Error subiendo la foto: ${err.message}`);
  } finally {
    photoSaveBtn!.textContent = 'Guardar';
    photoSaveBtn!.disabled = false;
  }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  window.location.href = '/';
});
