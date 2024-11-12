const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  tokenReinicio: String,
  expiracionTokenReinicio: Date,
  carrito: {
    items: [
      {
        idProducto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
        cantidad: { type: Number, required: true }
      }
    ]
  }
});

usuarioSchema.methods.agregarAlCarrito = function(producto) {
  if (!this.carrito) {
    this.carrito = {items: []};
  }
  const indiceEnCarrito = this.carrito.items.findIndex(cp => {
    return cp.idProducto.toString() === producto._id.toString();
  });
  let nuevaCantidad = 1;
  const itemsActualizados = [...this.carrito.items];

  if (indiceEnCarrito >= 0) {
    nuevaCantidad = this.carrito.items[indiceEnCarrito].cantidad + 1;
    itemsActualizados[indiceEnCarrito].cantidad = nuevaCantidad;
  } else {
    itemsActualizados.push({
      idProducto: producto._id,
      cantidad: nuevaCantidad
    });
  }
  const carritoActualizado = {
    items: itemsActualizados
  };

  this.carrito = carritoActualizado;
  return this.save();
};

usuarioSchema.methods.deleteItemDelCarrito = function(idProducto) {
  const itemsActualizados = this.carrito.items.filter(item => {
    return item.idProducto.toString() !== idProducto.toString();
  });
  this.carrito.items = itemsActualizados;
  return this.save();
};

usuarioSchema.methods.limpiarCarrito = function() {
  this.carrito = { items: [] };
  return this.save();
};

module.exports = mongoose.model('Usuarios', usuarioSchema);

