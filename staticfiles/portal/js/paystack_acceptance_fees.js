    document.getElementById('payButton').addEventListener('click', function() {
        const btn = this;
        btn.classList.add('processing');
        btn.disabled = true;

        var handler = PaystackPop.setup({
            key: "{{ paystack_public_key }}",
            email: "{{ email }}",
            amount: {{ amount }},
            ref: "{{ reference }}",
            callback: function(response) {
                window.location.href = "{{ callback_url }}?reference=" + response.reference;
            },
            onClose: function() {
                btn.classList.remove('processing');
                btn.disabled = false;
                alert('Transaction was not completed.');
            },
        });
        handler.openIframe();
    });