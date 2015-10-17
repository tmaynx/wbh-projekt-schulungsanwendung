(function($) {
	'use strict';
	/**
	 * Stats module implementation
	 *
	 * @author Thomas May <thomas.may@namics.com>
	 * @namespace Tc.Module
	 * @class Stats
	 * @extends Tc.Module
	 */
	Tc.Module.Stats = Tc.Module.extend({
		$chart: null,

		init: function($ctx, sandbox, modId) {
			this._super($ctx, sandbox, modId);
		},

		on: function(callback) {
			this.bindAll(
				'getStats',
				'onGetStatsSuccess',
				'onGetStatsError'
			);
			this.$('.js-form').on('submit', this.getStats);
			// do not remove
			callback();
		},

		after: function() {
		},

		getStats: function(ev) {
			ev.preventDefault();
			$.ajax({
				url: $(ev.currentTarget).attr('action'),
				success: this.onGetStatsSuccess,
				error: this.onGetStatsError
			});
			this.$('.js-ajax-loader').removeClass('hidden');
			this.$('.js-pie-chart').addClass('hidden');
		},

		onGetStatsSuccess: function(data) {
			this.$('.js-ajax-loader, .js-pie-chart').toggleClass('hidden');

			if(!this.$chart){
				this.createChart(data);
			}else{
				this.updateChart(data);
			}
		},

		createChart: function(data) {
			var options = {
				 	labelInterpolationFnc: function(value) {
						return value[0]
					}
				},
				responsiveOptions = [
					['screen and (min-width: 640px)', {
						chartPadding: 30,
						labelOffset: 100,
						labelDirection: 'explode',
						labelInterpolationFnc: function(value) {
							return value;
						}
					}],
					['screen and (min-width: 1024px)', {
						labelOffset: 80,
						chartPadding: 20
					}]
				];
			this.$chart = new Chartist.Pie('.js-pie-chart', data, options, responsiveOptions);
		},

		updateChart: function(data) {
			data = {
				labels: ["Banana", "Apples", "Grapes"],
				series: [33, 33, 33]
			};
			this.$chart.update(data);
		},

		onGetStatsError: function(err) {
			console.log('err', err);
		}

	});
}(Tc.$));
