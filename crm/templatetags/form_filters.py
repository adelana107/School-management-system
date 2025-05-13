from django import template

register = template.Library()

@register.filter
def add_class(value, arg):
    """Add class to form field widget."""
    return value.as_widget(attrs={'class': arg})
