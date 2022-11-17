import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "bpmn-js-properties-panel/dist/assets/element-templates.css";
import "bpmn-js-properties-panel/dist/assets/properties-panel.css";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";

import Modeler from "bpmn-js/lib/Modeler";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
} from "bpmn-js-properties-panel";

import ZeebeBpmnModdle from "./override/zeebe.json";

// import CamundaBpmnModdle from "camunda-bpmn-moddle/resources/camunda.json";
import axios from "axios";

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
        propertiesPanel: {
          parent: panel,
        },
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          ZeebePropertiesProviderModule,
        ],
        moddleExtensions: {
          zeebe: ZeebeBpmnModdle,
        },
      });
    }
  }, [container, panel, bjsContainer]);

  useEffect(() => {
    if (diagram.length === 0) {
      diagramSet("<?xml version='1.0' encoding='UTF-8'?>");
    }
    (async () => {
      await modeler.createDiagram();
    })();
  }, [diagram, modeler]);

  const handleUserCreate = useCallback(async () => {
    await modeler.createDiagram();
  }, [modeler]);

  const handleUserSave = useCallback(async () => {
    try {
      await modeler.saveXML().then((xml) => console.log(xml));
      console.log("save");
    } catch (error) {
      console.log(error);
    }
  }, [modeler]);

  const handleUserImport = useCallback(async () => {
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
  }, [modeler, diagram, url]);

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
          <button onClick={handleUserSave}>SAVE</button>
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
