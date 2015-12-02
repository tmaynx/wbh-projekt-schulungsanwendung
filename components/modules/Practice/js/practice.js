(function($) {
	'use strict';
	/**
	 * Practice module implementation
	 *
	 * @author Thomas May <thomas.may@namics.com>
	 * @namespace Tc.Module
	 * @class Practice
	 * @extends Tc.Module
	 */
	Tc.Module.Practice = Tc.Module.extend({
		ingredients: [],
		rightAnswers: 0,
		wrongAnswers: 0,

		init: function($ctx, sandbox, modId) {
			this._super($ctx, sandbox, modId);
		},

		on: function(callback) {
			var mod = this;
			this.bindAll(
				'onGetNewRecipeSuccess',
				'onGetNewRecipeError',
				'onGetIngredientsSuccess',
				'onGetIngredientsError',
				'onPickIngredient',
				'onSubmitPracticeForm',
				'onSubmitPracticeFormSuccess',
				'onSubmitPracticeFormError',
				'updateIngredientList',
				'resolveRecipe',
				'finishPractice'
			);
			this.$ctx.on('updateIngredients', this.updateIngredientList);
			this.$ctx.on('resolved', this.resolveRecipe);
			this.$('.js-practice-form').on('submit', this.onSubmitPracticeForm);
			this.$('.js-cancel').on('click', this.finishPractice);
			this.$('.js-get-next-recipe').on('click', function(){
				mod.$ctx.trigger('resolved');
			});
			this.getIngredients();
			this.getNewRecipe();
			// do not remove
			callback();
		},

		after: function() {
		},

		getIngredients: function() {
			$.ajax({
				url: this.$ctx.data('service-ingredients'),
				success: this.onGetIngredientsSuccess,
				error: this.onGetIngredientsError
			});
		},

		onGetIngredientsSuccess: function(data) {
			var group,
				that = this,
				$container = this.$('.js-ingredients-container'),
				markup = this.$('#ingredients-template').html();

			data.ingredients.forEach(function(el, i, arr) {
				group = arr.filter(function(item) {
					return parseInt(item.yPos) === parseInt(i);
				});
				group.forEach(function(item){
					item.xPos = (item.xPos < 10) ? ('0' + item.xPos) : item.xPos;
				});
				group = group.sort(function(a, b) {
					return ((a.xPos < b.xPos) ? -1 : ((a.xPos > b.xPos) ? 1 : 0));
				});
				if(group.length) $container.append(that.template(markup, { group: group }));
			});

			$container.find('.js-pick-ingredient').on('click', this.onPickIngredient);
		},

		onGetIngredientsError: function(err) {
			console.log('error', err);
		},

		getNewRecipe: function() {
			$.ajax({
				url: this.$ctx.data('service-new-recipe'),
				success: this.onGetNewRecipeSuccess,
				error: this.onGetNewRecipeError
			});
		},

		onGetNewRecipeSuccess: function(data) {
			this.$('.js-insert-recipe').text(data.name);
			this.$('.js-recipe-input').val(data.id);
		},

		onGetNewRecipeError: function(err) {
			console.log('error', err);
		},

		onPickIngredient: function(ev) {
			var $el = $(ev.currentTarget),
				id = $el.data('id'),
				name = $el.data('name');

			$el.is('.selected') ? this.removeIngredient({ id: id, name: name }) : this.addIngredient({ id: id, name: name });
			$el.toggleClass('selected');
		},

		addIngredient: function(data) {
			this.ingredients.push({ name: data.name, id: data.id });
			this.$ctx.trigger('updateIngredients');
		},

		removeIngredient: function(data) {
			var index;
			$.each(this.ingredients, function(i, el) {
				if(el.id === data.id) return index = i;
			});
			this.ingredients.splice(index, 1);
			this.$ctx.trigger('updateIngredients');
		},

		onSubmitPracticeForm: function(ev) {
			ev.preventDefault();
			var $form = $(ev.currentTarget);
			$.ajax({
				url: $form.attr('action'),
				method: $form.attr('method'),
				data: $form.serialize(),
				success: this.onSubmitPracticeFormSuccess,
				error: this.onSubmitPracticeFormError
			});
		},

		onSubmitPracticeFormSuccess: function(data) {
			var self = this;
			data = JSON.parse(data);
			if(data.result === 'right'){
				this.rightAnswers += 1;
				this.$('.js-alert-success').removeClass('hidden');
			}
			else if(data.result === 'wrong'){
				this.wrongAnswers += 1;
				this.$('.js-alert-fail').removeClass('hidden');
			}
		},

		onSubmitPracticeFormError: function(err) {
			console.log('error', err);
		},

		resolveRecipe: function() {
			this.getNewRecipe();
			this.resetSelection();
		},

		updateIngredientList: function() {
			var data = { ingredients: this.ingredients };
			this.toggleMixBtn();
			this.$('.js-ingredient-list-container').html(this.template(this.$('#ingredient-list-template').html(), data));
		},

		finishPractice: function() {
			this.$ctx.addClass('hidden');
			this.fire('showStats', {
				right: this.rightAnswers,
				wrong: this.wrongAnswers
			}, ['practice']);
		},

		resetSelection: function() {
			this.$('.js-pick-ingredient').removeClass('selected');
			this.$('.js-alert-success, .js-alert-fail').addClass('hidden');
			this.ingredients = [];
			this.$ctx.trigger('updateIngredients');
		},

		toggleMixBtn: function() {
			if(this.ingredients.length){
				this.$('.js-submit').removeClass('disabled').attr('disabled', false);
			}else{
				this.$('.js-submit').addClass('disabled').attr('disabled', true);
			}
		}
	});
}(Tc.$));
