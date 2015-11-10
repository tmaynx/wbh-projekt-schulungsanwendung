(function($) {
	'use strict';
	/**
	 * Admin skin implementation for the Recipes module.
	 *
	 * @author Thomas May <thomas.may@namics.com>
	 * @namespace Tc.Module.Recipes
	 * @class Admin
	 * @extends Tc.Module
	 * @constructor
	 */
	Tc.Module.Recipes.Admin = function(parent) {
		this.$modal = {};
		/**
		 * override the appropriate methods from the decorated module (ie. this.get = function()).
		 * the former/original method may be called via parent.<method>()
		 */
		this.on = function(callback) {
			this.bindAll(
				'onGetIngredientsSuccess',
				'onGetIngredientsError',
				'registerClickListener',
				'onDeleteRecipe',
				'onEditRecipe',
				'onCreateRecipe',
				'onConfirmDeletion',
				'onDeleteRecipeSuccess',
				'onDeleteRecipeError',
				'onConfirmEditing',
				'onEditRecipeSuccess',
				'onEditRecipeError',
				'onConfirmCreate',
				'onCreateRecipeSuccess',
				'onCreateRecipeError',
				'destroySortable'
			);
			this.initModal();
			this.getIngredients();
			this.$ctx.on('rendered', this.registerClickListener);
			//calling parent method
			parent.on(callback);
		};

		this.after = function() {
			// calling parent method
			parent.after();
		};

		this.initSortable = function($el) {
			$el.find('.js-sortable').sortable({
				connectWith: '.js-connected',
				items: ':not(:disabled)'
			});
		};

		this.destroySortable = function(ev) {
			$(ev.currentTarget).find('.js-sortable').sortable('destroy');
		};

		this.initModal = function() {
			var that = this, $el, name;
			this.$('.js-modal').each(function(i, el) {
				$el = $(el);
				name = $el.data('name');
				that.$modal[name] = $el.modal({
					show: false,
				});
				that.$modal[name].on('hidden.bs.modal', that.destroySortable);
			});
		};

		this.getIngredients = function() {
			$.ajax({
				url: this.$ctx.data('service-ingredients'),
				success: this.onGetIngredientsSuccess,
				error: this.onGetIngredientsError
			});
		};

		this.onGetIngredientsSuccess = function(data) {
			this.ingredients = data;
		};

		this.onGetIngredientsError = function(err) {
			console.log('err', err);
		};

		this.registerClickListener = function() {
			var $createBtn = this.$('.js-create-recipe');
			this.$('.js-delete-recipe').off().on('click', this.onDeleteRecipe);
			this.$('.js-edit-recipe').off().on('click', this.onEditRecipe);
			$createBtn.removeAttr('disabled').removeClass('disabled').on('click', this.onCreateRecipe);
		};

		this.onDeleteRecipe = function(ev) {
			var $el = $(ev.currentTarget),
				$modal = this.$modal.delete;
			this.currentRecipeId = $el.data('recipe-id');
			$modal.find('.js-replace-recipe').text($el.data('recipe-name'));
			$modal.find('.js-delete-it').off().on('click', this.onConfirmDeletion);
			$modal.modal('show');
		};

		this.onConfirmDeletion = function(ev) {
			$.ajax({
				url: '/project/services/deleteCocktail.php',
				type: 'POST',
				data: { 'recipe': this.currentRecipeId },
				success: this.onDeleteRecipeSuccess,
				error: this.onDeleteRecipeError
			});
		};

		this.onDeleteRecipeSuccess = function() {
			this.$modal.delete.modal('hide');
			parent.getRecipes();
		};

		this.onDeleteRecipeError = function(err) {
			console.log('error', err);
		};

		this.onEditRecipe = function(ev) {
			var $el = $(ev.currentTarget),
				$modal = this.$modal.edit;
			this.currentRecipeId = $el.data('recipe-id');
			this.renderIngredientLists();
			this.initSortable($modal);
			$modal.find('.js-replace-recipe').text($el.data('recipe-name'));
			$modal.find('.js-edit-it').on('click', this.onConfirmEditing);
			$modal.modal('show');
		};

		this.renderIngredientLists = function() {
			var that = this,
				currentIngredients = [],
				allIngredients = [],
				data = {},
				addIt;

			parent.recipes.recipes.some(function(item) {
				if(that.currentRecipeId === item.id) return currentIngredients = item.ingredients;
			});

			this.ingredients.ingredients.forEach(function(item) {
				addIt = true;
				currentIngredients.forEach(function(name) {
					if(item.name === name) addIt = false;
				});
				if(addIt) allIngredients.push(item.name);
			});

			data = { type: 'Ausgewählte Zutaten', ingredients: currentIngredients };
			this.$('.js-selected-ingredients-list-container').html(this.template(this.$('#ingredients-list-template').html(), data));

			data = { type: 'Verfügbare Zutaten', ingredients: allIngredients };
			this.$('.js-all-ingredients-list-container').html(this.template(this.$('#ingredients-list-template').html(), data));
		};

		this.onConfirmEditing = function() {
			var data = this.getRecipeData();
			$.ajax({
				url: '/project/ajax.php?api=editRecipe',
				type: 'POST',
				data: data,
				success: this.onEditRecipeSuccess,
				error: this.onEditRecipeError
			});
		};

		this.onEditRecipeSuccess = function() {
			this.$modal.edit.modal('hide');
			parent.getRecipes();
		};

		this.onEditRecipeError = function() {
			console.log('error', err);
		};

		this.onCreateRecipe = function(ev) {
			var $el = $(ev.currentTarget),
				$modal = this.$modal.new,
				data = {};

			data = { type: 'Ausgewählte Zutaten', ingredients: [] };
			this.$('.js-selected-ingredients-list-container').html(this.template(this.$('#ingredients-list-template').html(), data));

			data = { type: 'Alle Zutaten', ingredients: this.ingredients.ingredients };
			this.$('.js-all-ingredients-list-container').html(this.template(this.$('#ingredients-list-template').html(), data));

			this.initSortable($modal);
			this.$('.js-form').on('submit', this.onConfirmCreate);
			$modal.modal('show');
		};

		this.onConfirmCreate = function(ev) {
			ev.preventDefault();
			var $form = $(ev.currentTarget),
				data = this.getRecipeData($form.find('input[name=name]').val());
			$.ajax({
				url: $form.attr('action'),
				type: $form.attr('method'),
				data: data,
				success: this.onCreateRecipeSuccess,
				error: this.onCreateRecipeError
			});
		};

		this.onCreateRecipeSuccess = function(data) {
			this.$modal.new.modal('hide');
			parent.getRecipes();
		};

		this.onCreateRecipeError = function(err) {
			console.log('err', err);
		};

		this.getRecipeData = function(name) {
			name = name || this.currentRecipeId;
			return {
				recipe: name,
				ingredients: this.getSelectedIngredients()
			};
		};

		this.getSelectedIngredients = function() {
			var arr = [];
			this.$('.js-selected-ingredients-list-container:visible button:not(:disabled)').each(function(i, el) {
				arr.push($(el).text());
			});
			return arr;
		};
	};
}(Tc.$));
