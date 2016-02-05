(function() {
  'use strict';

  angular
    .module('oscarsNew')
    .directive('scoreboard', scoreboard);

  /** @ngInject */
  function scoreboard() {
    var directive = {
      restrict: 'E',
      link: linkFunc
    };

    return directive;

    function linkFunc(scope, element, attrs, vm) {

      var margin = 10;
      var dur = 1000;
      var rectHeight = 50;
      var w = element.parent().width() - 30;
      var h = scope.users.length * (rectHeight + margin);

      var xScale = d3.scale.linear()
        .range([0, (w - 60)]);

      var svg = d3.select(element[0]).append('svg')
        .attr('width', w)
        .attr('height', h);

      var rectsGroup = svg.append('g')
        .attr('clas', 'rects');

      var picsGroup = svg.append('g')
        .attr('class', 'pics');

      var scoresGroup = svg.append('g')
        .attr('class', 'scores');

      var namesGroup = svg.append('g')
        .attr('class', 'names');

      var key = function(d) {
        return d.id;
      };


      console.log('dude')
      scope.$watch('userScores', function(newval) {
        console.log('yeah')
        if (newval === undefined) {
          return;
        }

        console.log(newval);

        // var h = newval.length * (rectHeight + margin);

        // svg.attr('height', h)

        var max = d3.max(newval, function(d) {
          return d.score;
        });

        var xUppper = _.reduce(scope.awards, function(sum, award, key) {
          sum += award.points;
          return sum;
        }, 0);

        xScale.domain([0, xUppper]);

        var rects = rectsGroup.selectAll('rect')
          .data(newval, key);

        rects.enter().append('rect')
          .attr('x', 60)
          .attr('height', rectHeight);


        rects.transition()
          .duration(dur)
          .style('fill', function(d) {
            if (scope.winner && d.score === max) {
              return 'steelblue';
            } else if (d.lastCorrect) {
              return '#B4F59A';
            } else {
              return 'pink';
            }
          })
          .attr('width', function(d) {
            return xScale(d.score);
          })
          .transition()
          .delay(dur)
          .duration(function(d, i) {
            return 500 + (i * 50);
          })
          .attr('y', function(d, i) {
            return i * (rectHeight + margin);
          });

        rects.exit().remove();



        var pics = picsGroup.selectAll('image')
          .data(newval, key);

        pics.enter().append('image')
          .attr('x', 0)
          // .text(function(d) {
          //  return d.info.first_name;
          // })
          .attr('xlink:href', function(d) {
            return 'http://graph.facebook.com/' + d.id + '/picture';
          })
          .attr('width', rectHeight)
          .attr('height', rectHeight)
          .style('cursor', 'pointer')
          // .on('click', function(d) {
          //     scope.$apply(function() {
          //         $location.path('/picks/' + d.id)
          //     })
          // })
          .append('svg:title')
          .text(function(d) {
            return d.name;
          });

        pics.transition()
          .delay(dur)
          .duration(function(d, i) {
            return 500 + (i * 50);
          })
          .attr('y', function(d, i) {
            return i * (rectHeight + margin);
          });
        // .style('font-size', (yScale.rangeBand()/4) + "px")

        pics.exit().remove();



        var scores = scoresGroup.selectAll('text')
          .data(newval, key);

        scores.enter().append('text');

        scores.transition()
          .duration(dur)
          .attr('x', function(d) {
            var x = xScale(d.score) + 65;

            if (x < 60) {
              return 60;
            } else {
              return x;
            }
          })
          .style('font-size', "20px")
          .transition()
          .delay(dur)
          .text(function(d) {
            return d.score;
          })
          .duration(function(d, i) {
            return 500 + (i * 50);
          })
          .attr('y', function(d, i) {
            return i * (rectHeight + margin) + 20;
          });

        scores.exit().remove();

        var names = namesGroup.selectAll('text')
          .data(newval, key);

        names.enter().append('text')
          .attr('x', 60);

        names.transition()
          .delay(dur)
          .duration(function(d, i) {
            return 500 + (i * 50);
          })
          .attr('y', function(d, i) {
            return (i * (rectHeight + margin)) + 45;
          })
          .text(function(d) {
            if (scope.winner && d.score === max) {
              return d.name + ' - WINNER!';
            }
            return d.name;
          });
      });

    }
  }

})();
