#
`gcloud auth login`
```gcloud projects add-iam-policy-binding shascam \
   --member serviceAccount:speech-to-text-quickstart@shascam.iam.gserviceaccount.com \
--role roles/speech.editor```
`gcloud auth application-default login`
`gcloud auth application-default set-quota-project shascam`