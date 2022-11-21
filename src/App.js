import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "bpmn-js-properties-panel/dist/assets/element-templates.css";
import "bpmn-js-properties-panel/dist/assets/properties-panel.css";
import "@bpmn-io/element-template-chooser/dist/element-template-chooser.css";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";

import Modeler from "bpmn-js/lib/Modeler";
import download from "downloadjs";
import ElementTemplateChooserModule from "@bpmn-io/element-template-chooser";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  CloudElementTemplatesPropertiesProviderModule,
} from "bpmn-js-properties-panel";

import ZeebeModdle from "zeebe-bpmn-moddle/resources/zeebe.json";
import MagicPropertiesProvider from "./Providers/Magic";
import magicDescriptor from './assets/magic.json'

import axios from "axios";
import TEMPLATES_PROPERTY from "./assets/template.json";
import DEFAULT_DIAGRAM from "./assets/diagram.bpmn";

function App() {
  const [diagram, diagramSet] = useState("");
  const [url, urlSet] = useState("");
  const container = document.getElementById("container");
  const bjsContainer = document.getElementsByClassName("bjs-container");
  const panel = document.getElementById("panel");

  const modeler = useMemo(() => {
    if (bjsContainer.length === 0) {
      return new Modeler({
        container,
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          MagicPropertiesProvider,
          ZeebePropertiesProviderModule,
          CloudElementTemplatesPropertiesProviderModule,
          ElementTemplateChooserModule,
        ],
        exporter: {
          name: "element-template-chooser-demo",
          version: "0.0.0",
        },
        keyboard: {
          bindTo: document,
        },
        propertiesPanel: {
          parent: panel,
        },
        moddleExtensions: {
          zeebe: ZeebeModdle,
          magic: magicDescriptor
        },
      });
    }
  }, [container, panel, bjsContainer]);

  useEffect(() => {
    if (diagram.length === 0) {
      diagramSet(DEFAULT_DIAGRAM);
    }
    (async () => {
      await modeler.createDiagram(DEFAULT_DIAGRAM);
      await modeler.get("elementTemplatesLoader").setTemplates(TEMPLATES_PROPERTY);
    })();
  }, [diagram, modeler]);

  const handleUserCreate = useCallback(async () => {
    await modeler.createDiagram();
  }, [modeler]);

  const handleUserSave = useCallback(async () => {
    try {
      await modeler.saveXML({ format: true }, (err, xml) => {
        if (!err) {
          download(xml, "diagram.bpmn", "application/xml");
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, [modeler]);

  const handleUserImport = useCallback(async (url) => {
    try {
      if (url !== "") {
        await axios
          .get(url)
          .then((r) => {
            diagramSet(r.data);
          })
          .catch((e) => {
            console.log(e);
          });

        await modeler
          .importXML(diagram)
          .then(({ warnings }) => {
            if (warnings.length) {
              console.log("Warnings", warnings);
            }
            const canvas = modeler.get("modeling");
            canvas.setColor("CalmCustomerTask", {
              stroke: "green",
              fill: "yellow",
            });
          })
          .catch((err) => {
            console.log("error", err);
          });
      }
    } catch (error) {
      console.log(error);
    }
  }, [modeler, diagram]);

  return (
    <div
      id="app"
      style={{
        display: "flex",
      }}
    >
      <div
        id="container"
        style={{
          width: "100vw",
          height: "90vh",
          margin: "0 auto",
          background: "white",
          padding: 10,
        }}
      >
        <div>
          <input
            type="text"
            placeholder="path to diagram"
            onChange={(e) => urlSet(e.target.value)}
          />
          <button id="js-open" onClick={() => handleUserImport(url)}>
            Open
          </button>
        </div>
        <div>
          <button onClick={handleUserSave}>DOWNLOAD</button>
          <button onClick={handleUserCreate}>CREATE</button>
        </div>
      </div>
      <div
        id="panel"
        style={{
          width: "25vw",
          height: "90vh",
          margin: "0 auto",
          background: "white",
        }}
      ></div>
    </div>
  );
}

export default App;
