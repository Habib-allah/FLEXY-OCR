
import React from 'react';
import { Alert,TouchableOpacity, View, ImageBackground,Text,Button } from "react-native";
import { RNCamera as Camera } from "react-native-camera";
import RNTextDetector from "react-native-text-detector";
import call from "react-native-phone-call";

import style, { screenHeight, screenWidth } from "./styles";

const PICTURE_OPTIONS = {
  quality: 1,
  fixOrientation: true,
  forceUpOrientation: true
};
export default class App extends React.Component {
  state = {
      loading: false,
      image: null,
      error: null,
      visionResp: []
    };

    takePicture = async camera => {
      this.setState({
        loading: true
      });
      try {
        const data = await camera.takePictureAsync(PICTURE_OPTIONS);
        if (!data.uri) {
          throw "OTHER";
        }
        this.setState(
          {
            image: data.uri
          },
          () => {
            console.log(data.uri);
            this.processImage(data.uri, {
              height: data.height,
              width: data.width
            });
          }
        );
      } catch (e) {
        console.warn(e);
      }
    };

    processImage = async (uri, imageProperties) => {
      const visionResp = await RNTextDetector.detectFromUri(uri);
      console.log(visionResp);
      if (!(visionResp && visionResp.length > 0)) {
        throw "UNMATCHED";
      }
      this.setState({
        visionResp: this.mapVisionRespToScreen(visionResp, imageProperties)
      });
    };

    mapVisionRespToScreen = (visionResp, imageProperties) => {
      const IMAGE_TO_SCREEN_Y = screenHeight / imageProperties.height;
      const IMAGE_TO_SCREEN_X = screenWidth / imageProperties.width;

      return visionResp.map(item => {
        return {
          ...item,
          position: {
            width: item.bounding.width * IMAGE_TO_SCREEN_X,
            height: item.bounding.height * IMAGE_TO_SCREEN_Y,
            left: item.bounding.left * IMAGE_TO_SCREEN_X,
            top: item.bounding.top * IMAGE_TO_SCREEN_Y
          }
        };
      });
    };

      makeCall=(recognizedText)=>{
            var matches = recognizedText.match(/\d+/g);
            var phoneNumber="";
            for (var i=0;i<matches.length;i++){
                phoneNumber+=matches[i];
            }
            const args={
                number:encodeURIComponent("*710*"+phoneNumber+"#"),
                prompt:true
            }
            if (recognizedText!==phoneNumber){
              Alert.alert(
                'Alert Title',
                "We couldn't recognize all the text :( ! \n Continue anyway ?",
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {text: 'OK', onPress: () => call(args)},
                ],
                {cancelable: false},
              );
            }
            else{
              call(args);
            }
            
      }

      //GET BACK HERE
      render(){
      return (
        <View style={style.screen}>
                  {!this.state.image ? (
                    <Camera
                      ref={cam => {
                        this.camera = cam;
                      }}
                      key="camera"
                      style={style.camera}
                      notAuthorizedView={null}
                      flashMode={'torch'}
                    >
                      {({ camera, status }) => {
                        if (status !== "READY") {
                          return null;
                        }
                        return (
                          <View style={style.buttonContainer}>
                            <TouchableOpacity
                              onPress={() => this.takePicture(camera)}
                              style={style.button}
                            />
                          </View>
                        );
                      }}
                    </Camera>
                  ) : null}
                  {this.state.image ? (
                    <ImageBackground
                      source={{ uri: this.state.image }}
                      style={style.imageBackground}
                      key="image"
                    >
                      {this.state.visionResp.map(item => {
                        if (item.text.length>=3) {
                          this.makeCall(item.text);
                            /* return (
                                <TouchableOpacity
                                 style={[style.boundingRect, item.position]}
                                 key={item.text}
                                 />
                            ); */
                        }

                      })}
                    </ImageBackground>
                  ) : null}
                </View>
              );
        }

}

