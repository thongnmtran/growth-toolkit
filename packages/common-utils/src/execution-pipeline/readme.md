# About the module Execution Pipeline

This readme file here is to help you get to understand how we implemented this Execution Pipeline module.
To discover more about why we implement this module or how it works, please refer to this document: [Execution Pipeline](https://katalon.atlassian.net/wiki/spaces/SG/pages/2347565069/Execution+Pipeline)

## Folder structure

- `"./base"`: Some very basic interfaces for the Execution Pipeline
- `"./pipeline"`: Some implementations for the Execution Pipeline
  - `"./basic-pipeline"`: A simple implementation for an Execution Pipeline.
    Handlers will have access to { context, sub-pipeline, pipeline, context-extractor }.
  - `"./common-pipeline"`: A more advanced pipeline that includes "Execution Error Result" and "Main Execution Result".
  - `"./multi-stages-pipeline"`: An advanced pipeline with some built-in stages.
- `"./common"`: Some common utils like extracting params/results from the context or modifying execution context...

## Models

- Pipeline:
  - Previous context
  - Sub-Pipeline:
    - Handlers
    - Context
    - Previous context (is passed from the parent pipeline)
    - Pipeline (parent pipeline)

## A simple description of how the pipeline work

- A `pipeline` will produce a new sub-pipeline for each execution.
- A `sub-pipeline` will contains all the needed information to run (e.g., handlers, params...). So it can run and rerun at any time.
- A `pipeline handler` will have access to the `execution context` and the `sub-pipeline` that executes this handler.
