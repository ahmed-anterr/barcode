frappe.ui.form.on("Sales Invoice", {
  received_barcode: function (frm) {
    var typingTimer;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      var scannedValue = frm.doc.received_barcode.trim();
      if (scannedValue) {
        receivedBarcode(frm, scannedValue);
      }
    }, 400);
  },
});

function receivedBarcode(frm, scannedValue) {
  frappe.call({
    method: "barcode.sales_invoice_customization.get_item_by_barcode",
    args: {
      barcode: scannedValue,
    },
    callback: function (response) {
      if (response && response.message) {
        let item_code = response.message;
        let items = frm.doc.items || [];
        let foundItem = false;

        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if (item.item_code === item_code) {
            // Item found: increase received_quantity by 1
            frappe.model.set_value(
              "Sales Invoice Item",
              item.name,
              "received_quantity",
              (item.received_quantity || 0) + 1,
            );
            foundItem = true;
            break;
          }
        }

        // If item not found, add it as a new row
        if (!foundItem) {
          let new_item = frappe.model.add_child(
            frm.doc,
            "Sales Invoice Item",
            "items",
          );
          frappe.model.set_value(
            new_item.doctype,
            new_item.name,
            "item_code",
            item_code,
          );
          frappe.model.set_value(
            new_item.doctype,
            new_item.name,
            "received_quantity",
            1,
          );
        }

        // Clear the received_barcode field after processing
        frm.set_value("received_barcode", "");
        frm.refresh_field("received_barcode");
        frm.refresh_field("items");
      }
    },
    error: function (response) {
      frm.set_value("received_barcode", "");
    },
  });
}
