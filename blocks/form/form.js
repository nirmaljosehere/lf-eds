import { moveInstrumentation } from '../../scripts/scripts.js';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildOptions(optionsText) {
  return optionsText
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean);
}

function buildField(row) {
  const cells = [...row.children];
  const fieldtype = cells[0]?.textContent?.trim()?.toLowerCase() || 'text';
  const label = cells[1]?.textContent?.trim() || '';
  const name = cells[2]?.textContent?.trim() || slugify(label) || fieldtype;
  const placeholder = cells[3]?.textContent?.trim() || '';
  const options = buildOptions(cells[4]?.textContent || '');
  const required = cells[5]?.textContent?.trim()?.toLowerCase() === 'true';
  const helptext = cells[6]?.textContent?.trim() || '';

  const wrapper = document.createElement('div');
  wrapper.className = `form-field form-field-${fieldtype}`;

  moveInstrumentation(row, wrapper);

  if (fieldtype === 'submit') {
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'button primary';
    button.textContent = label || 'Submit';
    moveInstrumentation(cells[1], button);
    wrapper.append(button);
    return wrapper;
  }

  const fieldLabel = document.createElement('label');
  fieldLabel.setAttribute('for', name);
  fieldLabel.textContent = label;
  moveInstrumentation(cells[1], fieldLabel);

  let control;
  if (fieldtype === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 4;
  } else if (fieldtype === 'select') {
    control = document.createElement('select');
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option;
      optionEl.textContent = option;
      control.append(optionEl);
    });
  } else if (fieldtype === 'checkbox') {
    control = document.createElement('input');
    control.type = 'checkbox';
  } else if (fieldtype === 'radio') {
    control = document.createElement('div');
    control.className = 'form-field-radio-group';
    options.forEach((option, index) => {
      const optionId = `${name}-${index}`;
      const optionInput = document.createElement('input');
      optionInput.type = 'radio';
      optionInput.name = name;
      optionInput.id = optionId;
      optionInput.value = option;
      if (required) optionInput.required = true;
      const optionLabel = document.createElement('label');
      optionLabel.setAttribute('for', optionId);
      optionLabel.textContent = option;
      const optionWrapper = document.createElement('span');
      optionWrapper.className = 'form-field-radio-option';
      optionWrapper.append(optionInput, optionLabel);
      control.append(optionWrapper);
    });
  } else {
    control = document.createElement('input');
    control.type = fieldtype;
  }

  if (['text', 'email', 'tel', 'number', 'textarea'].includes(fieldtype)) {
    if (placeholder) control.placeholder = placeholder;
  }
  if (fieldtype !== 'radio') {
    control.id = name;
    control.name = name;
    if (required) control.required = true;
  }

  if (fieldtype === 'checkbox') {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'form-field-checkbox-option';
    checkboxWrapper.append(control, fieldLabel);
    wrapper.append(checkboxWrapper);
  } else {
    wrapper.append(fieldLabel, control);
  }

  if (helptext) {
    const help = document.createElement('p');
    help.className = 'form-field-help';
    help.textContent = helptext;
    wrapper.append(help);
  }

  return wrapper;
}

export default function decorate(block) {
  const rows = [...block.children];
  const form = document.createElement('form');
  form.className = 'form';

  rows.forEach((row) => {
    form.append(buildField(row));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = document.createElement('p');
    message.className = 'form-success-message';
    message.textContent = 'Thank you! Your submission has been received.';
    form.replaceChildren(message);
  });

  block.replaceChildren(form);
}
