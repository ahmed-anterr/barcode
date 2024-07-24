import frappe
from frappe import _

@frappe.whitelist()
def get_item_by_barcode(barcode):
    item = frappe.db.sql("""
        SELECT parent AS item_code 
        FROM `tabItem Barcode`
        WHERE barcode = %s
    """, (barcode,), as_dict=True)

    if item:
        return item[0].get('item_code')
    else:
        frappe.throw(_("Barcode not found in any items."))
