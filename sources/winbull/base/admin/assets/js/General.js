// JavaScript Document
function selectAll(cb, tableId, cellIndex) {
    if (typeof jQuery === 'undefined') return;
    var $ = jQuery;
    var isChecked = $(cb).prop('checked');
    var $table = $('#' + tableId);
    if (!$table.length) return;

    if (cellIndex !== undefined) {
        $table.find('tr').each(function () {
            $(this).find('td').eq(cellIndex).find('input[type="checkbox"]').prop('checked', isChecked).trigger('change');
        });
    } else {
        $table.find('input[type="checkbox"]').prop('checked', isChecked).trigger('change');
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const inputs = document.querySelectorAll('.form-control');
    // Restrict copy paste and drag and drop  (START)
    // inputs.forEach(function(input) {
    //     input.addEventListener('dragover', function(event) {
    //         event.preventDefault(); // Prevent dragover
    //     });

    //     input.addEventListener('drop', function(event) {
    //         event.preventDefault(); // Prevent drop
    //     }); 

    //     input.addEventListener('paste', function(event) {
    //         event.preventDefault(); // Prevent paste
    //     });
    // });

    // Restrict copy paste and drag and drop  (END)
    document.querySelectorAll('input[type="number"]').forEach(function (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "e" || event.key === "E") {
                event.preventDefault();
            }
        });
    });
});


/**
 * 🧠 Universal Input Validation Helper
 * ------------------------------------------------------------
 * Handles keypress validation for multiple input types.
 * Usage:
 *   onkeypress="validateKeyPress(event, this, TYPE)"
 *   onkeydown="validateKeyPress(event, this,4)"
 * 
 * TYPE Reference:
 *   1 → Integer (Only positive digits)
 *   2 → Decimal (Positive with up to 3 decimals)
 *   3 → Signed Decimal (Allows negatives, up to 3 decimals)
 *   4 → Alphanumeric + Limited Special (A-Za-z0-9 - space)
 *   5 → Alphabets Only (A-Z a-z with single spaces)
 *   6 → Alphanumeric + $-() + space
 * ------------------------------------------------------------
 */

function validateKeyPress(event, input, type, maxLength = 0, decimalLength = 0) {
    const key = event.key;
    const value = input.value;
    const cursorStart = input.selectionStart;
    const cursorEnd = input.selectionEnd;
    const nextValue = value.slice(0, cursorStart) + key + value.slice(cursorEnd);
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Shift'];
    const specialChars = ['-'];

    // Block emojis or non-ASCII symbols
    if (/[\u{1F600}-\u{1F6FF}]/u.test(key) || /[^\x00-\x7F]/.test(key)) return event.preventDefault();

    // Allow navigation/control keys
    if (allowedKeys.includes(key)) return;

    // Block spaces if data-no-spaces attribute is present
    if (key === ' ' && input.hasAttribute('data-no-spaces')) return event.preventDefault();

    // 1. Max Length Check (String Length)
    // Priority: Function Argument > HTML Attribute
    const effectiveMaxLength = maxLength > 0 ? maxLength : (input.getAttribute('maxlength') || 0);
    if (effectiveMaxLength > 0 && value.length >= effectiveMaxLength && !allowedKeys.includes(key)) {
        // Allow dot key for decimal types (2, 3) even at max length
        if (key === '.' && (type === 2 || type === 3) && !value.includes('.')) {
            // Allow dot to pass through — decimal logic will handle the rest
        } else if (cursorEnd === cursorStart) {
            event.preventDefault();
            showToast(`Maximum length is ${effectiveMaxLength}`, 'warning');
            return;
        }
    }

    // 2. Max Value Check (Numeric Value for Types 1, 2, 3)
    // Only applies if 'max' attribute is set on the input
    const maxVal = parseFloat(input.getAttribute('max'));
    if (!isNaN(maxVal) && (type === 1 || type === 2 || type === 3)) {
        // Predict usage: if the new number > max, prevent it.
        // Note: We only check if the resulting string is a valid number less than max.
        // This can be tricky with partial inputs (ex: max 100, typing 1..0..0). 
        // We'll simplistic check: parse nextValue.
        if (nextValue !== '-' && nextValue !== '.') { // don't check partial signs/dots
            const outcome = parseFloat(nextValue);
            if (!isNaN(outcome) && outcome > maxVal) {
                event.preventDefault();
                showToast(`Value cannot exceed ${maxVal}`, 'warning');
                return;
            }
        }
    }

    // ==============================
    // TYPE 1 → INTEGER (no decimals)
    // ==============================
    if (type === 1) {
        if (!/^\d$/.test(key)) event.preventDefault();
    }

    // ==========================================
    // TYPE 2 → DECIMAL (only positive, up to 3dp)
    // ==========================================

    if (type === 2) {
        // Allow only digits and one dot
        if (!/[\d.]/.test(key)) return event.preventDefault();
        if (key === '.' && value.includes('.')) return event.preventDefault();
        if (value === '' && key === '.') return event.preventDefault(); // prevent starting with '.'

        const [integerPart = '', decimalPart = ''] = nextValue.split('.');

        // Restrict integer part length (maxLength - decimalLength - 1 for the dot)
        if (decimalLength > 0 && effectiveMaxLength > 0) {
            const maxIntegerDigits = effectiveMaxLength - decimalLength - 1;
            if (maxIntegerDigits >= 0 && integerPart.length > maxIntegerDigits && key !== '.') {
                return event.preventDefault();
            }
        }

        // Restrict decimal part (after '.')
        if (decimalPart && decimalPart.length > (decimalLength || 3)) { // Default 3 if not provided
            return event.preventDefault();
        }
    }

    // =================================================
    // TYPE 3 → SIGNED DECIMAL (allows negatives & 3dp)
    // =================================================
    else if (type === 3) {
        if (!/[\d.-]/.test(key)) return event.preventDefault();
        if (key === '-' && (value.includes('-') || cursorStart !== 0)) return event.preventDefault();
        if (key === '.' && value.includes('.')) return event.preventDefault();
        if (nextValue === '.') return event.preventDefault();

        const [integerPart, decimalPart] = nextValue.split('.');
        if (integerPart.replace('-', '').length > 6 || (decimalPart && decimalPart.length > (decimalLength || 3))) event.preventDefault();
    }

    // ================================================================
    // TYPE 4 → ALPHANUMERIC + LIMITED SPECIALS (A-Za-z0-9 - space only)
    // ================================================================
    else if (type === 4) {
        const allowedCharacters = /^[A-Za-z0-9 ]$/; // Alphanumeric and space only (No hyphens)

        // Prevent consecutive or leading spaces
        if (key === ' ' && (value.endsWith(' ') || value.match(/\s{2,}$/) || value.length === 0)) event.preventDefault();

        // Allow only allowed characters
        if (!allowedCharacters.test(key)) event.preventDefault();
    }


    // ==============================================
    // TYPE 5 → ALPHABETS ONLY (A-Z with single space)
    // ==============================================
    else if (type === 5) {
        const cursorPos = input.selectionStart;
        const isAllowed = /^[A-Za-z ]$/.test(key) || allowedKeys.includes(key);

        if (!isAllowed) return event.preventDefault();

        // Prevent leading, trailing, or multiple spaces
        if (key === ' ') {
            if (cursorPos === 0 || value[cursorPos - 1] === ' ' || value[cursorPos] === ' ') {
                event.preventDefault();
                return;
            }
        }
    }

    // ==================================================================
    // TYPE 6 → ALPHANUMERIC + $-() + SPACE  (for address or misc fields)
    // ==================================================================
    else if (type === 6) {

        const allowedCharacters = /^[A-Za-z0-9$().\- ]$/;

        // Block leading or double space
        if (key === ' ' && (value.length === 0 || value.endsWith(' '))) { event.preventDefault(); return; }

        // Block invalid characters (dot allowed)
        if (!allowedCharacters.test(key)) { event.preventDefault(); return; }
    }
    // ================================================================
    // TYPE 7 → ALPHANUMERIC + LIMITED SPECIALS (A-Za-z0-9 - only)
    // ================================================================
    else if (type === 7) {
        const allowedCharacters = /^[A-Za-z0-9\-]$/;

        // ✅ Allow starting with number or letter (no restriction)
        if (specialChars.includes(key) && value.length === 0) event.preventDefault();

        // Prevent consecutive or leading spaces
        if (key === ' ' && (value.endsWith(' ') || value.match(/\s{2,}$/) || value.length === 0)) event.preventDefault();

        // Allow only allowed characters
        if (!allowedCharacters.test(key)) event.preventDefault();
    }
    // ================================================================
    // TYPE 8 → ALPHANUMERIC + LIMITED SPECIALS (A-Za-z0-9 - space , adn . only)
    // ================================================================
    else if (type === 8) {
        const allowedCharacters = /^[A-Za-z0-9\- .,]$/;

        // ✅ Allow starting with number or letter (no restriction)
        if (specialChars.includes(key) && value.length === 0) event.preventDefault();

        // Prevent consecutive or leading spaces
        if (key === ' ' && (value.endsWith(' ') || value.match(/\s{2,}$/) || value.length === 0)) event.preventDefault();

        // Allow only allowed characters
        if (!allowedCharacters.test(key)) event.preventDefault();
    }

    // ==================================================================
    // TYPE 9 -> Mixed Alphanumeric (No Numbers Only)
    // ==================================================================
    else if (type === 9) {
        const allowedCharacters = /^[A-Za-z0-9\- ]$/; // Allows letters, numbers, hyphen, space

        // Prediction Check: If it doesn't contain a letter yet, and current key isn't a letter, check later 
        // OR simpler: Just let them type and let validateForm catch the final "numbers only" on submit.
        // But for keypress: only restrict characters.
        if (!allowedCharacters.test(key)) event.preventDefault();
    }

    // ==================================================================
    // TYPE 10 -> URL / API Call (Alphanumeric + : / . _ ? = & % + -)
    // ==================================================================
    else if (type === 10) {
        const allowedCharacters = /^[A-Za-z0-9:\/._?=&%+\-]$/;
        if (!allowedCharacters.test(key)) event.preventDefault();
    }
    // ==================================================================
    // TYPE 11 -> Email Safe Characters (Alphanumeric + . + @)
    // ==================================================================
    else if (type === 11) {
        const allowedCharacters = /^[A-Za-z0-9.@]$/;
        if (!allowedCharacters.test(key)) event.preventDefault();
    }
    // ==================================================================
    // TYPE 12 -> Letters Only (No Space, No Numbers, No Specials)
    // ==================================================================
    else if (type === 12) {
        const allowedCharacters = /^[A-Za-z]$/;
        if (!allowedCharacters.test(key)) event.preventDefault();
    }
}


// for disabled commodity start from common_helper.php
function validateCheck(checkboxId, inputId, input_value) {
    const checkbox = document.getElementById(checkboxId);
    const input = document.getElementById(inputId);

    if (!checkbox || !input) return; // safety check

    if (checkbox.checked) {
        input.removeAttribute('disabled');
        input.value = input_value;
    } else {
        input.setAttribute('disabled', 'disabled');
        input.value = 0;
    }
}

function showToast(message, type = 'success', delay = 4000) {
    const numericDelay = Number(delay) || 4000;
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const displayType = type === 'danger' ? 'error' : type;

    // Duplicate Check
    const existing = Array.from(container.querySelectorAll('.toast')).find(t =>
        t.getAttribute('data-message') === message.trim()
    );
    if (existing) return;

    // Icon Mapping (Matching reference image)
    let iconClass = 'bi-check-circle-fill';
    if (displayType === 'error') iconClass = 'bi-x-circle-fill';
    if (displayType === 'warning') iconClass = 'bi-exclamation-triangle-fill';
    if (displayType === 'info') iconClass = 'bi-info-circle-fill';

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${displayType} border-0 shadow-lg`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.setAttribute('data-message', message.trim());

    toastEl.style.setProperty('--bs-toast-max-width', '600px');
    toastEl.style.setProperty('max-width', '600px', 'important');
    toastEl.style.setProperty('width', 'auto', 'important');
    toastEl.style.minWidth = '200px';
    toastEl.style.pointerEvents = 'auto';

    toastEl.innerHTML = `
        <div class="toast-body" style="display: flex !important; align-items: center !important; gap: 8px; padding: 8px 12px !important; flex-wrap: wrap;">
            <i class="bi ${iconClass}" style="flex-shrink: 0;"></i>
            <span class="toast-message" style="font-size: 0.85rem; white-space: normal; word-break: break-word;"></span>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close" style="width: 0.65em; height: 0.65em; flex-shrink: 0; margin-left: 4px;"></button>
        </div>
        <div class="toast-progress">
            <div class="toast-progress-active" style="width: 100%; transition: width ${numericDelay}ms linear;"></div>
        </div>
    `;
    
    // Safely set message text content (prevents XSS)
    toastEl.querySelector('.toast-message').textContent = message;

    container.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, { delay: numericDelay, autohide: true });
    toast.show();

    // Trigger progress bar animation (if visible in CSS)
    setTimeout(() => {
        const progress = toastEl.querySelector('.toast-progress-active');
        if (progress) progress.style.width = '0%';
    }, 10);

    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}


function showConfirmModal(title, message, confirmCallback) {
    document.getElementById('commonModalTitle').textContent = title;
    // Use innerHTML to support line breaks in message
    var msgEl = document.getElementById('commonModalMessage');
    msgEl.innerHTML = message.replace(/\n/g, '<br>');

    const confirmBtn = document.getElementById('commonConfirmBtn');
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', function () {
        if (typeof confirmCallback === 'function') confirmCallback();
        const modal = bootstrap.Modal.getInstance(document.getElementById('commonConfirmModal'));
        if (modal) modal.hide();
    });

    const myModal = new bootstrap.Modal(document.getElementById('commonConfirmModal'));
    myModal.show();
}

function showFlashMessage(successMsg, errorMsg) {
    // Show messages using the unified showToast system
    if (errorMsg) {
        showToast(errorMsg, 'danger');
    }

    if (successMsg) {
        showToast(successMsg, 'success');
    }

    // Clear flashdata if any message exists
    if (successMsg || errorMsg) {
        // Get CSRF token from meta tag or cookie
        var _csrfName = (typeof csrf_token_name !== 'undefined') ? csrf_token_name : '';
        var csrfToken = $('meta[name="csrf-token"]').attr('content') ||
                        (_csrfName ? $('input[name="' + _csrfName + '"]').val() : '');
        
        $.ajax({
            url: base_url + "index.php/C_main/clear_flash",
            method: "POST",
            headers: csrfToken ? {'X-CSRF-TOKEN': csrfToken} : {},
            success: function () {
                // Flash data cleared
            },
            error: function () {
                // Failed to clear flash data
            }
        });
    }
}




function showLoader() {
    $("#loader").show();
}

function hideLoader() {
    $("#loader").hide();
}


// for disabled commodity end


// Clear Toaster
document.addEventListener('DOMContentLoaded', function () {
    const toastElList = [].slice.call(document.querySelectorAll('.toast'));
    toastElList.forEach(function (toastEl) {
        const toast = new bootstrap.Toast(toastEl, {
            delay: 4000,
            autohide: true
        });
        toast.show();
    });
});



// Common AJAX existence checker
function checkAlreadyExists(tableName, columnName, value) {
    var exists = false;
    $.ajax({
        type: "POST",
        dataType: "json",
        url: base_url + "index.php/C_ajax/Chk_Exist_Common",
        data: {
            table: tableName,
            column: columnName,
            value: value
        },
        async: false, // Note: Consider refactoring to async with callback
        success: function (data) {
            if (data.status) {
                exists = true;
            }
        },
        error: function () {
            showToast('Error checking duplicate for ' + columnName, 'danger');
        }
    });
    return exists;
}



// Validates a form's required and length constraints on submit
/**
 * 🛠️ Global Custom Form Validation Interceptor
 * ------------------------------------------------------------
 * Disables default browser validation bubbles and uses 
 * our custom "Pro Max" toast notifications instead.
 * ------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', function () {
    // 1. Disable native validation bubbles for all forms
    document.querySelectorAll('form').forEach(form => {
        form.setAttribute('novalidate', true);
    });

    // 2. Intercept form submissions
    document.addEventListener('submit', function (event) {
        const form = event.target;
        if (form.tagName === 'FORM') {
            // Force novalidate just in case it was missed
            form.setAttribute('novalidate', true);

            // Run our custom validation
            if (!validateForm(event, form)) {
                // Validation failed, stop the submit
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }
        }
    }, true); // Use capture phase to run BEFORE other scripts
});

function validateForm(event, form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    let radioChecked = {};

    for (let input of inputs) {
        // Skip hidden, disabled
        if (input.type === 'hidden' || input.disabled) continue;

        const label = input.closest('.form-group')?.querySelector('label')?.innerText.replace('*', '').trim() ||
            input.placeholder ||
            input.name;
        const value = input.value.trim();

        // 1. Required Check
        if (input.hasAttribute('required')) {
            if (input.type === 'radio') {
                const groupName = input.name;
                if (!radioChecked[groupName]) {
                    const checkedOne = form.querySelector(`input[name="${groupName}"]:checked`);
                    if (!checkedOne) {
                        showToast(`Please select ${label}`, 'error');
                        input.focus();
                        isValid = false;
                        break;
                    }
                    radioChecked[groupName] = true;
                }
            } else if (input.type === 'checkbox') {
                if (!input.checked) {
                    showToast(`Please check ${label}`, 'error');
                    input.focus();
                    isValid = false;
                    break;
                }
            } else if (value === '') {
                showToast(`${label} is required!`, 'error');
                input.focus();
                isValid = false;
                break;
            }
        }

        // 2. Min Length Check
        const minLen = input.getAttribute('minlength');
        if (minLen && value.length < minLen && value.length > 0) {
            showToast(`${label} must be at least ${minLen} characters`, 'error');
            input.focus();
            isValid = false;
            break;
        }

        // 3. Min Value Check (New)
        const minVal = input.getAttribute('min');
        if (minVal && value !== '' && !isNaN(value)) {
            if (parseFloat(value) < parseFloat(minVal)) {
                showToast(`${label} must be at least ${minVal}`, 'error');
                input.focus();
                isValid = false;
                break;
            }
        }

        // 4. No Numbers Only Check (New)
        if (input.hasAttribute('data-no-numbers-only') && value !== '') {
            if (!/[a-zA-Z]/.test(value)) {
                showToast(`${label} must contain letters!`, 'error');
                input.focus();
                isValid = false;
                break;
            }
        }

        // 5. No Spaces Check (New)
        if (input.hasAttribute('data-no-spaces') && value !== '') {
            if (/\s/.test(value)) {
                showToast(`${label} cannot contain spaces!`, 'error');
                input.focus();
                isValid = false;
                break;
            }
        }

        // 6. URL/API Start Check (New)
        if (input.hasAttribute('data-is-url') && value !== '') {
            if (!/^(https?:\/\/|www\.)/i.test(value)) {
                showToast(`${label} must start with http://, https:// or www.`, 'error');
                input.focus();
                isValid = false;
                break;
            }
        }

        // 7. Advanced Data Validation (data-validate="type rule")
        const valAttr = input.getAttribute('data-validate');
        if (valAttr && value !== '') {
            const valTypes = valAttr.split(' ');

            for (const valType of valTypes) {
                // A. Regex Pattern Matching (Must Match)
                const patterns = {
                    'mobile': { r: /^[6-9]\d{9}$/, m: 'Invalid Mobile Number (10 digits)' },
                    'email': { r: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, m: 'Invalid Email Address' },
                    'pan': { r: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, m: 'Invalid PAN Number format' },
                    'gst': { r: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, m: 'Invalid GST Number format' },
                    'ifsc': { r: /^[A-Z]{4}0[A-Z0-9]{6}$/, m: 'Invalid IFSC Code' },
                    'pincode': { r: /^[1-9][0-9]{5}$/, m: 'Invalid Pincode' }
                };

                if (patterns[valType]) {
                    if (!patterns[valType].r.test(value)) {
                        showToast(`${label}: ${patterns[valType].m}`, 'error');
                        input.focus();
                        isValid = false;
                        break; // Break inner loop
                    }
                }

                // B. Negative Checks (Must NOT Match)
                if (valType === 'no-consecutive-dots') {
                    if (/\.\./.test(value)) {
                        showToast(`${label} cannot contain consecutive dots (..)`, 'error');
                        input.focus();
                        isValid = false;
                        break; // Break inner loop
                    }
                }

                if (valType === 'no-repeats') {
                    if (value.length > 4 && /^(\S)\1+$/.test(value)) {
                        showToast(`${label} cannot contain only repetitive characters`, 'error');
                        input.focus();
                        isValid = false;
                        break; // Break inner loop
                    }
                }
            }
            if (!isValid) break; // Break input loop
        }
    }

    if (!isValid) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        return false;
    }

    return true;
}

// Apply max length to ALL DataTables search boxes
$(document).on('init.dt', function () {
    $('.dataTables_filter input[type="search"]').attr('maxlength', 50);
});


/**
 * 🚫 showDeleteBlockedModal(message)
 * ------------------------------------------------------------
 * Shows a persistent red modal when a delete is blocked
 * due to FK dependency or business rule (type: 'blocked').
 *
 * Usage (in any listing AJAX delete handler):
 *   showDeleteBlockedModal(response.message);
 *
 * No inline modal HTML needed in any view — this function
 * creates and manages the modal dynamically.
 * ------------------------------------------------------------
 */
function showDeleteBlockedModal(message) {
    const modalId = 'commonDeleteBlockedModal';

    // Remove any existing instance first
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content" style="border: 2px solid #dc3545;">
                    <div class="modal-header" style="background-color:#dc3545; color:#fff; border-bottom:none;">
                        <h5 class="modal-title" style="white-space:nowrap;">&#9940; Cannot Delete</h5>
                        <button type="button" class="close" data-bs-dismiss="modal"
                            style="color:#fff; opacity:1; background:none; border:none; font-size:1.4rem; line-height:1; padding: 0 4px;">
                            &times;
                        </button>
                    </div>
                    <div class="modal-body" style="padding:20px;">
                        <div class="alert alert-danger" style="font-size:14px; margin-bottom:0;">
                            <strong>&#9888; Deletion Blocked!</strong><br><br>
                            <span id="${modalId}Msg"></span>
                        </div>
                    </div>
                    <div class="modal-footer" style="border-top:1px solid #f5c6cb;">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalEl = document.getElementById(modalId);
    // Safely set message text content (prevents XSS)
    modalEl.querySelector(`#${modalId}Msg`).textContent = message;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Auto-cleanup after hidden
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
}


/**
 * 📁 validateFileInput(file, options)
 * ------------------------------------------------------------
 * Reusable file validation helper for any upload input.
 * Validates MIME type, extension, and file size.
 * Shows a showToast() warning on failure and clears the input.
 *
 * Usage:
 *   var file = $('#my_input').prop('files')[0];
 *   if (!validateFileInput(file, { inputId: 'my_input' })) return;
 *
 * Options (all optional, sensible defaults apply):
 *   allowedTypes  → array of MIME strings
 *                   default: ['image/jpeg','image/jpg','image/png','image/gif','image/webp']
 *   allowedExt    → RegExp for filename extension
 *                   default: /\.(jpg|jpeg|png|gif|webp)$/i
 *   maxSizeMB     → max file size in MB  (default: 5)
 *   inputId       → id of the <input type="file"> to reset on failure (optional)
 *   label         → human-readable name shown in error messages (default: 'File')
 *
 * Returns: true if valid, false if invalid (toast already shown).
 * ------------------------------------------------------------
 */
function validateFileInput(file, options) {
    options = options || {};

    var allowedTypes = options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    var allowedExt   = options.allowedExt   || /\.(jpg|jpeg|png|gif|webp)$/i;
    var maxSizeMB    = options.maxSizeMB    || 5;
    var label        = options.label        || 'File';
    var inputId      = options.inputId      || null;

    function resetInput() {
        if (inputId) $('#' + inputId).val('');
    }

    // 1. No file selected
    if (!file) {
        showToast('Please select a ' + label + ' first.', 'warning');
        return false;
    }

    // 2. MIME type check
    if (allowedTypes.indexOf(file.type) === -1) {
        showToast('Invalid file type. Allowed: ' + allowedTypes.map(function(t){ return t.split('/')[1]; }).join(', ').toUpperCase(), 'danger');
        resetInput();
        return false;
    }

    // 3. Extension check (guards against spoofed MIME)
    if (!allowedExt.test(file.name)) {
        showToast('Invalid file extension. Only image files are allowed.', 'danger');
        resetInput();
        return false;
    }

    // 4. File size check
    if (file.size > maxSizeMB * 1024 * 1024) {
        showToast(label + ' is too large. Maximum allowed size is ' + maxSizeMB + ' MB.', 'danger');
        resetInput();
        return false;
    }

    return true;
}
