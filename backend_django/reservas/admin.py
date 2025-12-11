from django.contrib import admin
from .models import Negocio, Servicio, Cliente, Cita, Mesa


@admin.register(Negocio)
class NegocioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'propietario', 'telefono', 'email_contacto', 'activo', 'creado_en')
    list_filter = ('activo', 'creado_en')
    search_fields = ('nombre', 'direccion', 'telefono', 'email_contacto')


@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'negocio', 'duracion_minutos', 'precio', 'activo')
    list_filter = ('negocio', 'activo')
    search_fields = ('nombre', 'descripcion')


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'negocio', 'email', 'telefono', 'creado_en')
    list_filter = ('negocio',)
    search_fields = ('nombre', 'email', 'telefono')


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'servicio', 'negocio', 'fecha', 'hora_inicio', 'hora_fin', 'estado', 'creado_en')
    list_filter = ('negocio', 'fecha', 'estado')
    search_fields = ('cliente__nombre', 'servicio__nombre', 'notas')


@admin.register(Mesa)
class MesaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'negocio', 'servicio', 'tipo', 'capacidad_min', 'capacidad_max', 'activa')
    list_filter = ('negocio', 'servicio', 'tipo', 'activa')
    search_fields = ('nombre', 'servicio__nombre', 'negocio__nombre')
