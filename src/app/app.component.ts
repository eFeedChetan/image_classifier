import {
  Component,
  ElementRef,
  VERSION,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
// // const mobilenet = require('@tensorflow-models/mobilenet');
import * as mobilenet from '@tensorflow-models/mobilenet';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'image_classifier';
  model: any;
  imageSrc: any;
  predictionList: any;
  @ViewChild('preview') preview: any;
  @ViewChild('predictions') predictions: any;
  @ViewChild('captchaRef') captchaRef: any;
  public captchaResolved: boolean = false;
  async ngOnInit(): Promise<void> {}
  async checkCaptcha(captchaResponse: string) {
    this.captchaResolved =
      captchaResponse && captchaResponse.length > 0 ? true : false;

    if (this.captchaResolved) {
      const model = await this.loadModel();
      const preprocessedImage = this.preprocessImage(
        this.preview.nativeElement
      );
      const predictions = await this.classifyImage(model, preprocessedImage);
      this.displayPredictions(predictions);
    }
  }
  loadModel = async () => {
    const version = 2;
    const alpha = 0.5;
    const model = await mobilenet.load({ version, alpha });
    return model;
  };
  preprocessImage = (imageElement: any) => {
    const imageTensor = tf.browser.fromPixels(imageElement);
    const resizedImageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
    // const normalizedImageTensor = resizedImageTensor.div(255.0);
    return resizedImageTensor;
  };

  classifyImage = async (
    model: { classify: (arg0: any) => any },
    preprocessedImage: tf.Tensor3D
  ) => {
    const predictions = await model.classify(preprocessedImage);

    return predictions;
  };

  displayPredictions = (predictions: any[]) => {
    this.predictionList = this.predictions.nativeElement;
    this.predictionList.innerHTML = '';
    predictions.slice(0, 3).forEach((prediction) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${prediction.className}: ${Math.round(
        prediction.probability * 100
      )}%`;
      this.predictionList.appendChild(listItem);
    });
  };
  handleFileInput(event: any) {
    const imageFile = event.target.files[0];
    // this.imageSrc = URL.createObjectURL(imageFile);
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async (_event) => {
      const url = reader.result;
      this.preview.nativeElement.src = url;
      if (this.captchaResolved) {
        this.captchaRef.reset();
        this.predictionList.innerHTML = '';
      }
    };
    this.preview.nativeElement.style.display = 'block';
  }
}
