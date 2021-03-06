async function fetchCV2() {
	var resp = await fetch('https://raw.githubusercontent.com/tyleo-rec/CircuitsV2Resources/master/misc/circuitsv2.json')
	var data = await resp.json()
	return data
}

function fetchFilters(cv2, nodes) {
	let filter_list = [];

	for (var i = 0; i < nodes.length; i++) {
		let chip = cv2.Nodes[nodes[i]]
		chip.NodeFilters.forEach(function(filterGroup, i) {
			if (!filter_list.includes(filterGroup.FilterPath[0])) {
				filter_list.push(filterGroup.FilterPath[0])
			}
		})
	}

	return filter_list
}
function fetchSubFilters(cv2, nodes) {
	let sub_filters = [];

	for (var i = 0; i < nodes.length; i++) {
		let chip = cv2.Nodes[nodes[i]]
		chip.NodeFilters.forEach(function(filterGroup, i) {
			if (!sub_filters.includes(filterGroup.FilterPath[0])) {
				sub_filters.push(filterGroup.FilterPath[0])
			}
		})
	}

	return sub_filters
}

async function main() {
	const cv2 = await fetchCV2()
	const nodes = Object.keys(cv2.Nodes)
	const filters = fetchFilters(cv2, nodes)
	const sub_filters = fetchSubFilters(cv2, nodes)
	
	console.log(cv2)
	// Setup filters
	let filter_div = $('#filter-list:first')
	filters.forEach(function(elem) {
		var checkbox_container = document.createElement('div')
		var checkbox_text = document.createElement('p')
		var button = document.createElement('input')
		button.type = 'checkbox'
		checkbox_text.textContent = elem
		
		checkbox_container.addEventListener('click',function() {
			if (this.childNodes[0].checked == false) { this.childNodes[0].checked = true} 
			else { this.childNodes[0].checked = false }
			searchCV2($('#search-cv2')[0].value)
			console.log($('#search-cv2')[0].value)

		},capture=true)

		button.addEventListener('click',function(e) {
			e.preventDefault()
			searchCV2($('#search-cv2')[0].value)
			console.log($('#search-cv2')[0].value)
		},capture=true)

		// checkbox_text.onclick = function() {
		// 	if (this.parentNode.childNodes[0].checked == false) { this.parentNode.childNodes[0].checked = true} 
		// 	else { this.parentNode.childNodes[0].checked = false }
		// }
		
		checkbox_container.append(button)
		checkbox_container.append(checkbox_text)
		filter_div.append(checkbox_container)
	})

	function searchCV2(value) {
		$('#search-results').empty()
		
		// Append all names of $('filter-list:checked')
		var filter = [];
		$('#filter-list div input:checked').siblings().each(function(i,elem) {filter.push(elem.textContent)})
		console.log(filter)
		for (var i = 0; i < nodes.length; i++) {
			let raw_name = nodes[i]
			let chip = cv2.Nodes[nodes[i]]
			let results = [];

			// Search through all and check if value is inside chip name
			if (filter.length > 0){
				var filter_0;
				var filter_1;

				try {filter_0 = chip.NodeFilters[0].FilterPath.filter(x => filter.includes(x))}
				catch(e) {filter_0 = []}

				try {filter_1 = chip.NodeFilters[1].FilterPath.filter(x => filter.includes(x))}
				catch(e) {filter_1 = []}

				var final = filter_0.concat(filter_1).filter(function onlyUnique(value, index, self) {
					return self.indexOf(value) === index;
				  })

				if (final.length == filter.length) {
				} else {
					continue
				}
	
				// if (filter_0.length == filter.length) {
				// } else {
				// 	continue
				// }
			}

			if (chip.ReadonlyName.toLowerCase().includes(value.toLowerCase())) {
				var inputs
				var outputs

				try { var inputs = chip.NodeDescs[0].Inputs }
				catch { var inputs = [] }
				
				try { var outputs = chip.NodeDescs[0].Outputs }
				catch { var outputs = [] }

				try { var anyTypes = chip.NodeDescs[0].ReadonlyTypeParams }
				catch { var anyTypes = [] }
				
				results.push([
							chip.ReadonlyName,
							inputs,
							outputs,
							raw_name,
							anyTypes,
							])
			}
			
			// Append all elements found in search to table
			results.forEach(function(elem) {
				let list_item = document.createElement('li')
				// let container = document.createElement('div')

				$('#search-results').append(list_item)
				
				// Append chip name/hash to an attribute to lookup later
				list_item.chip = elem[3]

				// When list item is clicked, open up a menu and show description for chips +
				// Enlarged version of chips with tooltips for each port
				list_item.onclick = function(e) {
					if (e.target.classList.contains('clickable') || e.target.tagName == 'LI') {
						let target = e.target.closest('li')
						if (target.className == '') {
							if (target.querySelector('.chip-details-container') === null){
								let chip_details = cv2.Nodes[target.chip]
								
								let cont = document.createElement('div')
								let descTitle = document.createElement('p')
								let desc = document.createElement('p')
								let chip_preview_large = target.querySelector('.chip-preview').cloneNode(true)
								chip_preview_large.className = 'clickable chip-large-preview'

								cont.classList.add('chip-details-container')
								cont.classList.add('clickable')
								cont.id = 'chip-info-container'

								if (chip_details.Description != ''){
									desc.textContent = chip_details.Description
								} else {
									desc.textContent = 'No Description Available.'
								}

								desc.style.fontWeight = 300
								
								// Remove stuff when it is clicked to close list item
								target.addEventListener("transitionend", function() {
									if (this.style.maxHeight == '80px') {
										cont.remove()
									}
								});

								target.addEventListener("transitionstart", function() {
									let container = this.querySelector('.chip-details-container')

									if (container !== null) {
										if (this.style.maxHeight == '80px') { // If list element it is enlarging
											container.style.marginTop = '20px'
											container.style.opacity = 0
										} else if (parseInt(this.style.maxHeight) > 80) { // If it is returning to regular size
											container.style.opacity = 1
											container.style.marginTop = '0'
										}
									}
								});
								
								descTitle.textContent = 'Description'
								descTitle.classList.add('chip-description')
								descTitle.classList.add('clickable')
								desc.classList.add('clickable')
								
								cont.append(descTitle)
								cont.append(desc)
								cont.append(chip_preview_large)
								target.append(cont)
								
								target.className = 'on-click-chip'
								target.style.maxHeight = '700px'
							}
						} else {
							target.className = ''
							target.style.maxHeight = '80px'
						}
					}
				}
				
				chip = document.createElement('div')
				chip.className = 'clickable chip-preview'

				inputs = document.createElement('div')
				inputs.className = 'clickable input-port'
				
				outputs = document.createElement('div')
				outputs.className = 'clickable output-port'
				
				//Iterate through all input ports of chip and add them and their css classes
				elem[1].forEach(function(input) {
					let chipInput = document.createElement('div')
					let name = input.ReadonlyType.split(' ').join('-').replace('<','-').replace('>','').toLowerCase()
					let tooltip = input.ReadonlyType

					if (name == 't') {
						tooltip = elem[4]['T']
					}
					chipInput.className = 'clickable chip-port chip-type-' + name

					let chipTooltip = document.createElement('div')
					let chipTooltipTitle = document.createElement('p')
					let chipTooltipType = document.createElement('p')
					chipTooltip.classList.add('chip-port-tooltip')
					chipTooltipTitle.Name = input.Name
					chipTooltipType.textContent = tooltip
					
					chipTooltip.append(chipTooltipTitle)
					chipTooltip.append(chipTooltipType)
					chipInput.append(chipTooltip)
					inputs.append(chipInput)
				})
				
				//Iterate through all output ports of chip and add them and their css classes
				elem[2].forEach(function(output) {
					let chipOutput = document.createElement('div')
					let name = output.ReadonlyType.split(' ').join('-').replace('<','-').replace('>','').toLowerCase()
					let tooltip = output.ReadonlyType

					if (name == 't') {
						tooltip = elem[4]['T']
						// console.log(tooltip)
					}
					
					chipOutput.className = 'clickable chip-port chip-type-' + name
					let chipTooltip = document.createElement('div')
					let chipTooltipTitle = document.createElement('p')
					let chipTooltipType = document.createElement('p')
					chipTooltip.classList.add('chip-port-tooltip')
					chipTooltipTitle.textContent = output.Name
					chipTooltipType.textContent = tooltip

					chipTooltip.append(chipTooltipTitle)
					chipTooltip.append(chipTooltipType)
					chipOutput.append(chipTooltip)
					outputs.append(chipOutput)
				})
				
				chip.append(inputs)
				chip.append(outputs)
				
				list_item.append(chip)
				// list_item.append(container)
				text = document.createElement('p')
				text.textContent = elem[0]
				text.className = 'clickable'
				list_item.append(text)
				
			})
		}
	}
	
	searchCV2($('#search-cv2')[0].value)

	$('#search-cv2').on('input',function(e){
		searchCV2(e.target.value)
	});
	

	
}
main()