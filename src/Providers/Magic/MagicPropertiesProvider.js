import { is } from "bpmn-js/lib/util/ModelUtil";
import SpellProps from "./parts/SpellProps";

const LOW_PRIORITY = 500;


export default function MagicPropertiesProvider(propertiesPanel, translate) {
  this.getGroups = function (element) {
    return (groups) => {
      var magicTab = {
        id: "magic",
        label: "Magic",
        groups: createMagicGroup(element, translate)
      };

      if (is(element, "bpmn:StartEvent")) {
        groups.push(magicTab);
      }

      return groups;
    };
  };

  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

function createMagicGroup(element, translate) {

  // create a group called "Magic properties".
  const magicGroup = {
    id: 'magic',
    label: translate('Magic properties'),
    entries: SpellProps(element, translate)
  };

  return magicGroup
}

MagicPropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];