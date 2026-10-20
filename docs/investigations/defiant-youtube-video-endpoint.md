# Controlled YouTube video endpoint differential

The first actual selected-source preprocessing attempt was rejected. A subsequent diagnostic attempt returned Google HTTP 500 / `INTERNAL`, with the bounded private message “Internal error encountered.” This does not establish a schema, IAM, source-availability or regional-support defect. No successful video-analysis outcome is claimed here.

Google's [direct YouTube sample](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/samples/googlegenaisdk-textgen-with-youtube-video) uses a global location in its Java example and defaults to global in Node. The [video-understanding guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/video-understanding?hl=en) supports public YouTube URL input and shows global REST examples. The [Gemini 3.5 Flash-Lite model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite?hl=en) supports video and global/us/eu. These sources do **not** state that YouTube input is unsupported in `us`.

The dedicated video method therefore uses `global` by default as a controlled differential matching the documented example. A server constructor or `AI_VIDEO_LOCATION` can explicitly select `global`, `us` or `eu`; this field is absent from editable gateway settings and analysis request DTOs. Campaign model/location settings remain unchanged. The trace records the actual video location. There is one provider request, no retry/fallback chain, and the existing source window/output/budget constraints still apply.

This is a candidate correction to be accepted or rejected using one explicit ordinary browser analysis. It is not a confirmed explanation for the provider's internal error, a region-health claim, or a new model/service deployment. The follow-up PR remains draft until the actual outcome is reviewed.

## JSON-mode compatibility differential

The global request also returned HTTP 500 / `INTERNAL`, as did a second selected public source. Global routing did not resolve the failure. The next bounded candidate omits the provider `responseSchema`, keeps JSON MIME mode, and states the exact moments object shape in the prompt. This is JSON mode versus API-schema generation, not a claim that only one request byte changed. The strict local response-object and moment validators, model, global endpoint, actual video clipping window, output/time/budget limits and single-request behavior remain unchanged. There is no automatic retry or fallback.

This isolates a possible controlled-generation interaction; Google's [structured-output guidance](https://firebase.google.com/docs/ai-logic/generate-structured-output) supports multimodal video output, so the interaction is not a documented incompatibility. If this candidate also receives the same internal rejection, further request permutations stop and the unresolved provider dependency remains explicit. No successful analysis is claimed.
