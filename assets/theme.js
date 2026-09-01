/* Balloon Friends — theme scripts */
(function () {
  'use strict';

  var moneyFormat = window.BF && window.BF.moneyFormat ? window.BF.moneyFormat : '£{{amount}}';

  function formatMoney(cents) {
    var value = (cents / 100).toFixed(2);
    if (value.slice(-3) === '.00') value = value.slice(0, -3);
    return moneyFormat.replace(/\{\{\s*amount[a-z_]*\s*\}\}/, (cents / 100).toFixed(2));
  }

  /* Mobile menu */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-menu-toggle]');
    if (toggle) {
      var nav = document.querySelector('[data-site-nav]');
      if (nav) {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }
  });

  /* Scroll-in animation */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.animate-in').forEach(function (el) { observer.observe(el); });
  } else {
    document.querySelectorAll('.animate-in').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Toast */
  function toast(message) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Bundle builder                                                      */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('[data-bundle]').forEach(function (box) {
    var unitPrice = parseInt(box.dataset.unitPrice, 10); /* cents */
    var bundleSize = parseInt(box.dataset.bundleSize, 10) || 3;
    var freePerBundle = parseInt(box.dataset.freePerBundle, 10) || 1;
    var tiles = Array.prototype.slice.call(box.querySelectorAll('.bundle-tile'));
    var slotsWrap = box.querySelector('[data-bundle-slots]');
    var countLabel = box.querySelector('[data-bundle-count]');
    var savingLabel = box.querySelector('[data-bundle-saving]');
    var totalWrap = box.querySelector('[data-bundle-total]');
    var addBtn = box.querySelector('[data-bundle-add]');
    var errorEl = box.querySelector('[data-bundle-error]');

    var selection = {}; /* variantId -> {qty, name, image, emoji} */

    tiles.forEach(function (tile) {
      tile.addEventListener('click', function (e) {
        if (e.target.closest('.bundle-tile__minus')) return;
        change(tile, 1);
      });
      var minus = tile.querySelector('.bundle-tile__minus');
      if (minus) {
        minus.addEventListener('click', function (e) {
          e.stopPropagation();
          change(tile, -1);
        });
      }
    });

    function change(tile, delta) {
      var id = tile.dataset.variantId;
      var current = selection[id] ? selection[id].qty : 0;
      var next = Math.max(0, current + delta);
      if (next === 0) {
        delete selection[id];
      } else {
        selection[id] = {
          qty: next,
          name: tile.dataset.variantName,
          image: tile.dataset.variantImage || '',
          emoji: tile.dataset.variantEmoji || '🎈'
        };
      }
      render();
    }

    function totalQty() {
      return Object.keys(selection).reduce(function (sum, id) { return sum + selection[id].qty; }, 0);
    }

    function render() {
      var qty = totalQty();
      var freeItems = Math.floor(qty / bundleSize) * freePerBundle;
      var fullPrice = qty * unitPrice;
      var payPrice = (qty - freeItems) * unitPrice;

      tiles.forEach(function (tile) {
        var id = tile.dataset.variantId;
        var q = selection[id] ? selection[id].qty : 0;
        tile.classList.toggle('is-selected', q > 0);
        var badge = tile.querySelector('.bundle-tile__qty');
        if (badge) badge.textContent = q;
      });

      if (slotsWrap) {
        var flat = [];
        Object.keys(selection).forEach(function (id) {
          for (var i = 0; i < selection[id].qty; i++) flat.push(selection[id]);
        });
        var slotCount = Math.max(bundleSize, Math.ceil(qty / bundleSize) * bundleSize || bundleSize);
        slotCount = Math.min(slotCount, bundleSize * 3);
        var html = '';
        for (var s = 0; s < slotCount; s++) {
          var item = flat[s];
          if (item) {
            html += '<div class="bundle-progress__slot is-filled" title="Tap to remove">' +
              (item.image ? '<img src="' + item.image + '" alt="' + item.name + '">' : '<span>' + item.emoji + '</span>') +
              '</div>';
          } else {
            html += '<div class="bundle-progress__slot"><span style="opacity:.35">+</span></div>';
          }
        }
        slotsWrap.innerHTML = html;
      }

      if (countLabel) countLabel.textContent = 'Your bundle · ' + qty + ' of ' + Math.max(bundleSize, Math.ceil(qty / bundleSize) * bundleSize || bundleSize);
      if (savingLabel) {
        if (freeItems > 0) {
          savingLabel.textContent = 'Saving ' + formatMoney(freeItems * unitPrice) + ' 🎉';
          savingLabel.hidden = false;
        } else {
          var needed = bundleSize - qty;
          savingLabel.textContent = qty === 0 ? '' : 'Add ' + needed + ' more to get 1 FREE';
          savingLabel.hidden = qty === 0;
        }
      }

      if (totalWrap) {
        if (qty === 0) {
          totalWrap.innerHTML = '<span>Pick your friends above</span><span class="bundle-total__pay">' + formatMoney(unitPrice) + ' <small style="font-weight:400;font-size:1.3rem;">each</small></span>';
        } else if (freeItems > 0) {
          totalWrap.innerHTML = '<span>Total</span><span><span class="bundle-total__was">' + formatMoney(fullPrice) + '</span><span class="bundle-total__pay">' + formatMoney(payPrice) + '</span></span>';
        } else {
          totalWrap.innerHTML = '<span>Total</span><span class="bundle-total__pay">' + formatMoney(payPrice) + '</span>';
        }
      }

      if (addBtn) {
        addBtn.disabled = qty === 0;
        if (qty === 0) {
          addBtn.textContent = 'Tap a friend to start your bundle';
        } else if (freeItems > 0) {
          addBtn.textContent = 'Add bundle to basket — ' + formatMoney(payPrice);
        } else {
          addBtn.textContent = 'Add ' + qty + ' to basket — ' + formatMoney(payPrice);
        }
      }
    }

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var items = Object.keys(selection).map(function (id) {
          return { id: parseInt(id, 10), quantity: selection[id].qty };
        });
        if (!items.length) return;
        addBtn.disabled = true;
        addBtn.textContent = 'Adding…';
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items })
        })
          .then(function (r) {
            if (!r.ok) return r.json().then(function (d) { throw new Error(d.description || 'Could not add to basket'); });
            return r.json();
          })
          .then(function () { return fetch('/cart.js').then(function (r) { return r.json(); }); })
          .then(function (cart) {
            updateCartCount(cart.item_count);
            window.location.href = window.BF && window.BF.cartUrl ? window.BF.cartUrl : '/cart';
          })
          .catch(function (err) {
            if (errorEl) {
              errorEl.textContent = err.message;
              errorEl.style.display = 'block';
            }
            addBtn.disabled = false;
            render();
          });
      });
    }

    render();
  });

  /* ------------------------------------------------------------------ */
  /* Cart page quantity controls                                         */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('[data-cart-qty]').forEach(function (wrap) {
    var input = wrap.querySelector('input');
    wrap.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var delta = btn.dataset.dir === 'up' ? 1 : -1;
        var next = Math.max(0, parseInt(input.value || '0', 10) + delta);
        input.value = next;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    input.addEventListener('change', function () {
      var line = parseInt(wrap.dataset.line, 10);
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: line, quantity: parseInt(input.value || '0', 10) })
      })
        .then(function (r) { return r.json(); })
        .then(function () { window.location.reload(); })
        .catch(function () { toast('Something went wrong — please refresh.'); });
    });
  });
})();
