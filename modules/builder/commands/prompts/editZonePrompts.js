/**
 * #file
 *
 * Zone properties edit prompts.
 */

module.exports.editZoneName = function(session, zid) {
  var values = Zones.zone['zid'];
  Prompt.startEdit('edit_zone_name', session, 'name', values);
}

module.exports.editZoneDescription = function(session, zid) {
  var values = Zones.zone[zid];
  Prompt.startEdit('edit_zone_description', session, 'description', values);
}

module.exports.editZoneRating = function(session, zid) {
  var values = Zones.zone[zid];
  Prompt.startEdit('edit_zone_rating', session, 'rating', values);
}
