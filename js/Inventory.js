Inventory = function (id, amount) {
	let self = {
		items: [] // {id: 'itemId', amount:#}
	}
	self.addItem = function(id, amount) {
		for(i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id) {
				self.items[i].amount += amount;
				self.refreshRender();
				return;
			}
		}
		self.items.push({id:id, amount: amount });
		self.refreshRender();
	}

	self.removeItem= function(id, amount) {
		for(i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id) {
				self.items[i].amount -= amount;
				if(self.items[i].amount <= 0) {
					self.items.splice(i,1);
				}
				self.refreshRender();
				return;
			}
		}
	}

	self.hasItem =  function (id, amount) {
		for(i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id) {
				return self.items[i].amount >= amount;
			}
		}
		return false;
	}

	self.refreshRender = function() {
		let str = '';
		for(i = 0 ; i< self.items.length; i++){
			let item = Item.list[self.items[i].id];
			str += `<button onclick=Item.list['${item.id}'].event();> ${ item.name } x ${ self.items[i].amount } </butoon>`;
		}
		document.getElementById('inventory').innerHTML = str;
	}

	return self;
}

Item = function (id, name, event) {
	let self =      {
		id: id,
		name: name,
		event: event
	}
	Item.list[self.id] = self; // add item to list

	return self;
}

Item.list = {}

Item('potion', 'Potion', function() {
	player.hp =10;
	playerInventory.removeItem('potion', 1);
});

Item('enemy', 'Pawn Enemy', function() {
	Enemy.randomlyGenerate();
});
