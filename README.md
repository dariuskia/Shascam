# ShaScam: Live, AI-Enabled Call Security
## Overview

ShaScam leverages cutting-edge technologies to protect users from phishing and spam calls in real-time. By integrating Twilio's API for call management and Google Cloud's speech-to-text for live call transcription, alongside advanced LLM inference with a 13B parameter Llama 2 model, ShaScam provides an innovative defense mechanism against the rapidly evolving threat landscape of scam calls.

## Features

- [x] **Real-time Scam Analysis:** Utilizes Twilio for call routing and Google Cloud for transcription, analyzing conversations in real-time to detect scam likelihood.
- [x] **Intelligent Call Filtering:** Employs a 13B parameter Llama 2 model for dynamic analysis of call content, offering immediate risk assessment and response recommendations.
- [x] **User-Centric Design:** Offers a simple, intuitive interface for managing Twilio proxy numbers and receiving instant alerts on potential scam calls.

## Technical Challenges and Solutions

- **Data Acquisition:** Faced with the scarcity of quality spam call datasets, we navigated through various sources to compile a viable dataset for model training and validation.
- **Model Accuracy:** Addressed challenges in model generalization and overfitting by opting for a higher-parameter Llama 2 model and refining our dataset for enhanced precision in scam detection.
- **User Privacy and Autonomy:** Implemented Twilio proxy numbers to maintain user privacy and control over call monitoring, ensuring compliance with data collection and privacy standards.

## Future Directions

- [ ] **Enhanced Scam Trend Analysis:** Developing capabilities to categorize and analyze scam trends for personalized user alerts.
- [ ] **Model Fine-Tuning:** Continuous improvement of the LLM's accuracy through the acquisition and incorporation of diverse and high-quality data sets.

ShaScam represents a significant step forward in the use of AI and real-time data processing for scam call detection and prevention, offering users a proactive tool against potential security threats.

Built with ❤️ by Nitya Arora, Tanush Chopra, Sahil Gupta, and Darius Kianersi.