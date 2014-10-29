/*
 * L.Handler.CenterScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom
 * on the map. It differs from L.Handler.ScrollWheelZoom in that it keeps the center
 * of the map constant, rather than recentering on the cursor.
 */

L.Map.mergeOptions({
    centerScrollWheelZoom: false
});

L.Map.CenterScrollWheelZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
		this._delta = 0;
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll);
	},

	_onWheelScroll: function (e) {
		var delta = L.DomEvent.getWheelDelta(e);

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(40 - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(L.bind(this._performZoom, this), left);

		L.DomEvent.preventDefault(e);
		L.DomEvent.stopPropagation(e);
	},

	_performZoom: function () {
		var map = this._map,
		    delta = this._delta,
		    zoom = map.getZoom();

		delta = delta > 0 ? Math.ceil(delta) : Math.round(delta);
		delta = Math.max(Math.min(delta, 4), -4);
		delta = map._limitZoom(zoom + delta) - zoom;

		this._delta = 0;

		this._startTime = null;

		if (!delta) { return; }

		var newZoom = zoom + delta,
            newCenter = map.getCenter();

		map.setView(newCenter, newZoom);
	},

});

L.Map.addInitHook('addHandler', 'centerScrollWheelZoom', L.Map.CenterScrollWheelZoom);
