export class CartRecoveryAutomation {
    balancer;
    constructor(balancer) {
        this.balancer = balancer;
    }
    /**
     * Generates a modern abandoned cart HTML email template
     */
    generateCartHtml(cart) {
        const itemsHtml = cart.items
            .map((i) => `
        <tr style="border-bottom: 1px solid #2d3748;">
          <td style="padding: 12px; color: #f7fafc; font-weight: 500;">${i.name} (x${i.quantity})</td>
          <td style="padding: 12px; color: #10b981; font-weight: bold; text-align: right;">$${(i.price * i.quantity).toFixed(2)}</td>
        </tr>`)
            .join("");
        return `
      <!DOCTYPE html>
      <html>
      <body style="background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f7fafc; padding: 32px 16px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 12px; border: 1px solid #1f2937; overflow: hidden;">
          <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #1f2937;">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px;">You left something behind!</h1>
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">Your items are reserved and waiting for you.</p>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              ${itemsHtml}
              <tr>
                <td style="padding: 16px 12px; font-weight: bold; color: #ffffff;">Total:</td>
                <td style="padding: 16px 12px; font-weight: bold; color: #10b981; text-align: right;">$${cart.cartTotal.toFixed(2)}</td>
              </tr>
            </table>
            ${cart.discountCode
            ? `<div style="background-color: #064e3b; border: 1px dashed #10b981; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 24px;">
                    <span style="color: #a7f3d0; font-size: 14px;">Use code <strong>${cart.discountCode}</strong> for 10% off!</span>
                  </div>`
            : ""}
            <div style="text-align: center;">
              <a href="${cart.recoveryUrl}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Complete Your Order</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    /**
     * Dispatches the cart recovery email using available daily quota across connected providers
     */
    async dispatchRecoveryEmail(cart, sender) {
        const html = this.generateCartHtml(cart);
        const emailPayload = {
            to: [{ email: cart.customerEmail, name: cart.customerName }],
            from: sender,
            subject: `Complete your purchase at ${sender.name || "our store"}`,
            html,
            text: `You left items in your cart worth $${cart.cartTotal.toFixed(2)}. Complete your order here: ${cart.recoveryUrl}`,
            tags: { workflow: "cart_abandonment", cartId: cart.cartId }
        };
        return await this.balancer.send(emailPayload);
    }
}
//# sourceMappingURL=cart-recovery.js.map