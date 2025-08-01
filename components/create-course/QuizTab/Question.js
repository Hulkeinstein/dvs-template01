import React, { useState } from "react";

import Image from "next/image";

import TextEditorWrapper from "../TextEditorWrapper";

import img from "../../../public/images/others/thumbnail-placeholder.svg";

const Question = ({
  selectedOption,
  handleSelectChange,
  editor,
  answerEditor,
  currentQuestion,
  setCurrentQuestion,
  isEditing,
}) => {
  const [currentOption, setCurrentOption] = useState('');
  const [displayFormat, setDisplayFormat] = useState('text');
  const [optionImage, setOptionImage] = useState(null);
  const [questionImagePreview, setQuestionImagePreview] = useState(currentQuestion.questionImage || null);
  
  // Update preview when editing existing question
  React.useEffect(() => {
    if (currentQuestion.questionImage) {
      setQuestionImagePreview(currentQuestion.questionImage);
    }
  }, [currentQuestion.questionImage]);

  const handleAddOption = () => {
    if (!currentOption.trim()) return;
    
    const newOption = {
      text: currentOption,
      image: optionImage,
      id: Date.now().toString()
    };
    
    const updatedOptions = [...(currentQuestion.options || []), newOption];
    setCurrentQuestion({ 
      ...currentQuestion, 
      options: updatedOptions,
      // Set first option as default correct answer for Single Choice
      correctAnswer: currentQuestion.correctAnswer || (selectedOption === 'Single Choice' ? newOption.id : null)
    });
    
    // Reset input fields
    setCurrentOption('');
    setOptionImage(null);
  };

  const handleRemoveOption = (optionId) => {
    const updatedOptions = currentQuestion.options.filter(opt => opt.id !== optionId);
    setCurrentQuestion({ 
      ...currentQuestion, 
      options: updatedOptions,
      // Reset correct answer if removed
      correctAnswer: currentQuestion.correctAnswer === optionId ? null : currentQuestion.correctAnswer
    });
  };

  const handleSetCorrectAnswer = (optionId) => {
    if (selectedOption === 'Single Choice') {
      setCurrentQuestion({ ...currentQuestion, correctAnswer: optionId });
    } else if (selectedOption === 'Multiple Choice') {
      const currentAnswers = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer : [];
      const isSelected = currentAnswers.includes(optionId);
      
      setCurrentQuestion({ 
        ...currentQuestion, 
        correctAnswer: isSelected 
          ? currentAnswers.filter(id => id !== optionId)
          : [...currentAnswers, optionId]
      });
    }
  };

  const handleQuestionImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionImagePreview(reader.result);
        setCurrentQuestion({ ...currentQuestion, questionImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOptionImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <div className="content">
        <div className="course-field mb--20">
          <label htmlFor="modal-field-3">Write your question here</label>
          <input 
            id="modal-field-3" 
            type="text" 
            placeholder="Question" 
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
          />
        </div>
        
        {/* Question Image Upload */}
        <div className="course-field mb--20">
          <h6>Question Image (Optional)</h6>
          <div className="rbt-create-course-thumbnail upload-area">
            <div className="upload-area">
              <div className="brows-file-wrapper" data-black-overlay="9">
                <input
                  name="questionImageFile"
                  id="questionImageFile"
                  type="file"
                  className="inputfile"
                  accept="image/*"
                  onChange={handleQuestionImageUpload}
                />
                <Image
                  id="questionFileImage"
                  src={questionImagePreview || img}
                  width={797}
                  height={262}
                  alt="file image"
                  style={{ objectFit: 'cover' }}
                />
                {questionImagePreview && (
                  <button 
                    className="rbt-btn-close"
                    style={{ 
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      zIndex: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #ddd',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setQuestionImagePreview(null);
                      setCurrentQuestion({ ...currentQuestion, questionImage: null });
                      document.getElementById('questionImageFile').value = '';
                    }}
                  >
                    <i className="feather-x"></i>
                  </button>
                )}
                <label
                  className="d-flex"
                  htmlFor="questionImageFile"
                  title="No File Chosen"
                >
                  <i className="feather-upload"></i>
                  <span className="text-center">Choose Question Image</span>
                </label>
              </div>
            </div>
            <small>
              <i className="feather-info"></i> Upload an image to display with your question
            </small>
          </div>
        </div>
        <div className="course-field mb--20">
          <h6>Select your question type</h6>
          <div className="rbt-modern-select bg-transparent height-45 w-100 mb--10">
            <select
              className="w-100"
              value={selectedOption}
              onChange={handleSelectChange}
            >
              <option>True/False</option>
              <option>Single Choice </option>
              <option>Multiple Choice </option>
              <option>Open Ended</option>
              <option>Fill in the Blanks</option>
              <option>Sort Answer</option>
              <option>Matching</option>
              <option>Image Matching</option>
            </select>
          </div>
          <div className="d-flex align-items-center gap-5 mt--20">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="switchCheckAnswer"
                checked={currentQuestion.required}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, required: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="switchCheckAnswer">
                Answer Required
              </label>
            </div>
            {/* Only show Randomize for question types with multiple options */}
            {(selectedOption === 'Single Choice' || 
              selectedOption === 'Multiple Choice' || 
              selectedOption === 'Matching') && (
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchCheckRandomize"
                  checked={currentQuestion.randomize}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, randomize: e.target.checked })}
                />
                <label
                  className="form-check-label"
                  htmlFor="switchCheckRandomize"
                >
                  Randomize
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="course-field mb--20">
          <label htmlFor="modal-field-3">Point(s) for this answer</label>
          <div className="d-flex align-items-center gap-5 mb--20">
            <div className="content">
              <input
                className="mb-0"
                id="modal-field-3"
                type="number"
                placeholder="set the mark ex. 10"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <h6 className="mb-3">Description (Optional)</h6>
          <TextEditorWrapper
            value={currentQuestion.description || ''}
            onChange={(newContent) => {
              // onChange에서는 단순히 값만 저장 (URL 변환 없이)
              setCurrentQuestion({ ...currentQuestion, description: newContent });
            }}
            onBlur={() => {
              // 에디터에서 포커스가 벗어날 때 URL 변환 실행
              if (currentQuestion.description) {
                let processedContent = currentQuestion.description;
                
                // YouTube URL을 placeholder로 변환
                processedContent = processedContent.replace(
                  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\S*)?/g,
                  (match, videoId) => {
                    return `<div class="video-placeholder" data-video-type="youtube" data-video-id="${videoId}" contenteditable="false" style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; cursor: pointer;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
                      <div style="font-weight: bold;">YouTube Video</div>
                      <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${videoId}</div>
                      <div style="font-size: 11px; color: #999; margin-top: 5px;">(저장 시 영상으로 변환됩니다)</div>
                    </div>`;
                  }
                );
                
                // Vimeo URL을 placeholder로 변환
                processedContent = processedContent.replace(
                  /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:\S*)?/g,
                  (match, videoId) => {
                    return `<div class="video-placeholder" data-video-type="vimeo" data-video-id="${videoId}" contenteditable="false" style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; cursor: pointer;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
                      <div style="font-weight: bold;">Vimeo Video</div>
                      <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${videoId}</div>
                      <div style="font-size: 11px; color: #999; margin-top: 5px;">(저장 시 영상으로 변환됩니다)</div>
                    </div>`;
                  }
                );
                
                // 변환된 내용이 다른 경우에만 업데이트
                if (processedContent !== currentQuestion.description) {
                  setCurrentQuestion({ ...currentQuestion, description: processedContent });
                }
              }
            }}
          />
          <small>
            <i className="feather-info"></i> Input options for the question and
            select the correct answer.
          </small>

          <div
            className={`course-field mt--20 ${
              selectedOption === "Open Ended" ||
              selectedOption === "Sort Answer"
                ? "d-block"
                : "d-none"
            }`}
          >
            <small>
              <i className="feather-info"></i> No option is necessary for this
              answer type
            </small>
          </div>
          <div
            className={`course-field rbt-lesson-rightsidebar mt--20 ${
              selectedOption === "True/False" ? "d-block" : "d-none"
            }`}
          >
            <div className="row">
              <div className="col-lg-6">
                <div className="rbt-form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="rbt-radio"
                    id="rbt-single-1"
                    checked={currentQuestion.correctAnswer === true}
                    onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: true })}
                  />
                  <label className="form-check-label" htmlFor="rbt-single-1">
                    True
                  </label>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="rbt-form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="rbt-radio"
                    id="rbt-single-2"
                    checked={currentQuestion.correctAnswer === false}
                    onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: false })}
                  />
                  <label className="form-check-label" htmlFor="rbt-single-2">
                    False
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`course-field mt--20 ${
              selectedOption === "Single Choice" ||
              selectedOption === "Multiple Choice" ||
              selectedOption === "Matching"
                ? "d-block"
                : "d-none"
            }`}
          >
            <label htmlFor="modal-field-3">Answer Option</label>
            <input 
              id="modal-field-3" 
              type="text" 
              placeholder="Enter an option" 
              value={currentOption}
              onChange={(e) => setCurrentOption(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
            />
            {selectedOption === "Matching" ? (
              <div className="content">
                <label htmlFor="modal-Matching-1">Matching Answer title</label>
                <input
                  id="modal-Matching-1"
                  type="text"
                  placeholder="matching"
                />
              </div>
            ) : (
              ""
            )}
            {/* Show option image upload only when image or both is selected */}
            {(displayFormat === 'image' || displayFormat === 'both') && (
              <div className="course-field mt--20">
                <h6>Option Image</h6>
                <div className="rbt-create-course-thumbnail upload-area">
                  <div className="upload-area">
                    <div className="brows-file-wrapper" data-black-overlay="9">
                      <input
                        name="optionImageFile"
                        id="optionImageFile"
                        type="file"
                        className="inputfile"
                        accept="image/*"
                        onChange={handleOptionImageUpload}
                      />
                      <Image
                        id="optionFileImage"
                        src={optionImage || img}
                        width={797}
                        height={262}
                        alt="file image"
                        style={{ objectFit: 'cover' }}
                      />
                      {optionImage && (
                        <button 
                          className="rbt-btn-close"
                          style={{ 
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            zIndex: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #ddd',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            setOptionImage(null);
                            document.getElementById('optionImageFile').value = '';
                          }}
                        >
                          <i className="feather-x"></i>
                        </button>
                      )}
                      <label
                        className="d-flex"
                        htmlFor="optionImageFile"
                        title="No File Chosen"
                      >
                        <i className="feather-upload"></i>
                        <span className="text-center">Choose Option Image</span>
                      </label>
                    </div>
                  </div>
                  <small>
                    <i className="feather-info"></i> Upload an image for this answer option
                  </small>
                </div>
              </div>
            )}
              <h6 className="mb-2">Display format for options</h6>
              <div className="d-flex gap-4">
                <div className="rbt-form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="displayFormat"
                    id="rbt-radio1"
                    value="text"
                    checked={displayFormat === 'text'}
                    onChange={(e) => setDisplayFormat(e.target.value)}
                  />
                  <label
                    className="form-check-label h-auto"
                    htmlFor="rbt-radio1"
                  >
                    Only Text
                  </label>
                </div>
                <div className="rbt-form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="displayFormat"
                    id="rbt-radio2"
                    value="image"
                    checked={displayFormat === 'image'}
                    onChange={(e) => setDisplayFormat(e.target.value)}
                  />
                  <label
                    className="form-check-label h-auto"
                    htmlFor="rbt-radio2"
                  >
                    Image Only
                  </label>
                </div>
                <div className="rbt-form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="displayFormat"
                    id="rbt-radio3"
                    value="both"
                    checked={displayFormat === 'both'}
                    onChange={(e) => setDisplayFormat(e.target.value)}
                  />
                  <label
                    className="form-check-label h-auto"
                    htmlFor="rbt-radio3"
                  >
                    Text & Image both
                  </label>
                </div>
              </div>

              <button 
                className="rbt-btn rbt-sm-btn mt--20" 
                type="button"
                onClick={handleAddOption}
              >
                Add Option
              </button>
              
              {/* Options List */}
              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div className="mt--30">
                  <h6 className="mb--20">Answer Options</h6>
                  <div className="rbt-accordion-style rbt-accordion-04">
                    {currentQuestion.options.map((option, index) => (
                      <div key={option.id} className="rbt-accordion-item card mb--10">
                        <div className="rbt-accordion-body card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                              {selectedOption === 'Single Choice' ? (
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={currentQuestion.correctAnswer === option.id}
                                  onChange={() => handleSetCorrectAnswer(option.id)}
                                  className="form-check-input"
                                />
                              ) : selectedOption === 'Multiple Choice' ? (
                                <input
                                  type="checkbox"
                                  checked={currentQuestion.correctAnswer?.includes(option.id) || false}
                                  onChange={() => handleSetCorrectAnswer(option.id)}
                                  className="form-check-input"
                                />
                              ) : null}
                              <span className="fw-bold">Option {index + 1}:</span>
                              <span>{option.text}</span>
                              {option.image && (displayFormat === 'image' || displayFormat === 'both') && (
                                <Image
                                  src={option.image}
                                  width={50}
                                  height={50}
                                  alt={`Option ${index + 1}`}
                                  style={{ objectFit: 'cover', borderRadius: '4px' }}
                                />
                              )}
                            </div>
                            <button
                              type="button"
                              className="rbt-btn-close"
                              onClick={() => handleRemoveOption(option.id)}
                            >
                              <i className="feather-x"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div
            className={`course-field mt--20 ${
              selectedOption === "Image Matching" ? "d-block" : "d-none"
            }`}
          >
            <div className={`rbt-create-course-thumbnail upload-area mt--20`}>
              <h6>Upload Image</h6>
              <div className="upload-area mb--20">
                <div className="brows-file-wrapper" data-black-overlay="9">
                  <input
                    name="createinputfile"
                    id="createinputfile"
                    type="file"
                    className="inputfile"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCurrentQuestion({ 
                            ...currentQuestion, 
                            imageMatchingImage: reader.result 
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Image
                    id="createfileImage"
                    src={currentQuestion.imageMatchingImage || img}
                    width={797}
                    height={262}
                    alt="file image"
                    style={{ objectFit: 'cover' }}
                  />

                  <label
                    className="d-flex"
                    htmlFor="createinputfile"
                    title="No File Choosen"
                  >
                    <i className="feather-upload"></i>
                    <span className="text-center">Choose a File</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="content">
              <label htmlFor="modal-Image-1">Image matched text</label>
              <input 
                id="modal-Image-1" 
                type="text" 
                placeholder="" 
                value={currentQuestion.imageMatchingText || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, imageMatchingText: e.target.value })}
              />
            </div>
            <button 
              className="rbt-btn rbt-sm-btn mt--10" 
              type="button"
              onClick={() => {
                if (currentQuestion.imageMatchingImage && currentQuestion.imageMatchingText) {
                  const newPair = {
                    id: Date.now().toString(),
                    image: currentQuestion.imageMatchingImage,
                    text: currentQuestion.imageMatchingText
                  };
                  const pairs = currentQuestion.imageMatchingPairs || [];
                  setCurrentQuestion({ 
                    ...currentQuestion, 
                    imageMatchingPairs: [...pairs, newPair],
                    imageMatchingImage: null,
                    imageMatchingText: '',
                    correctAnswer: [...pairs, newPair].reduce((acc, pair) => {
                      acc[pair.id] = pair.text;
                      return acc;
                    }, {})
                  });
                  // Clear the file input
                  document.getElementById('createinputfile').value = '';
                }
              }}
            >
              Add Image-Text Pair
            </button>
            
            {/* Display added image-text pairs */}
            {currentQuestion.imageMatchingPairs && currentQuestion.imageMatchingPairs.length > 0 && (
              <div className="mt--20">
                <h6>Added Image-Text Pairs</h6>
                {currentQuestion.imageMatchingPairs.map((pair, index) => (
                  <div key={pair.id} className="d-flex align-items-center gap-3 mb--10 p-3 border rounded">
                    <Image
                      src={pair.image}
                      width={60}
                      height={60}
                      alt={`Pair ${index + 1}`}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <span>{pair.text}</span>
                    <button
                      type="button"
                      className="rbt-btn-close ms-auto"
                      onClick={() => {
                        const updatedPairs = currentQuestion.imageMatchingPairs.filter(p => p.id !== pair.id);
                        setCurrentQuestion({ 
                          ...currentQuestion, 
                          imageMatchingPairs: updatedPairs,
                          correctAnswer: updatedPairs.reduce((acc, p) => {
                            acc[p.id] = p.text;
                            return acc;
                          }, {})
                        });
                      }}
                    >
                      <i className="feather-x"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            className={`course-field mt--20 ${
              selectedOption === "Fill in the Blanks" ? "d-block" : "d-none"
            }`}
          >
            <label htmlFor="modal-field-3">Question Title</label>
            <input
              className="mb-0"
              id="modal-field-3"
              type="text"
              placeholder="title"
              value={currentQuestion.fillInBlanksQuestion || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, fillInBlanksQuestion: e.target.value })}
            />
            <small>
              <i className="feather-info"></i> Please make sure to use the dash
              variable in your question title to show the blanks in your
              question. You can use multiple dash variables in one question.
            </small>
            <div className={`rbt-create-course-thumbnail upload-area mt--20`}>
              <h6 className="mb-2">Correct Answer(s)</h6>
              <input
                className="mb-0"
                id="modal-field-3"
                type="text"
                placeholder="answer"
                value={currentQuestion.fillInBlanksAnswers || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, fillInBlanksAnswers: e.target.value })}
              />
              <small>
                <i className="feather-info"></i> Separate multiple answers by a
                vertical bar |. 1 answer per dash variable is defined in the
                question. Example: Apple | Banana | Orange question.
              </small>
            </div>
            <button 
              className="rbt-btn rbt-sm-btn mt--20" 
              type="button"
              onClick={() => {
                // Parse the answers and save to correctAnswer
                const answers = (currentQuestion.fillInBlanksAnswers || '').split('|').map(a => a.trim()).filter(a => a);
                setCurrentQuestion({ 
                  ...currentQuestion, 
                  correctAnswer: answers,
                  question: currentQuestion.fillInBlanksQuestion || ''
                });
              }}
            >
              Update Answer
            </button>
          </div>

          <div className="course-field mt--20">
            <h6 className="mb-3">Answer Explanation</h6>
            <TextEditorWrapper
              value={currentQuestion.explanation || ''}
              onChange={(newContent) => {
                // onChange에서는 단순히 값만 저장 (URL 변환 없이)
                setCurrentQuestion({ ...currentQuestion, explanation: newContent });
              }}
              onBlur={() => {
                // 에디터에서 포커스가 벗어날 때 URL 변환 실행
                if (currentQuestion.explanation) {
                  let processedContent = currentQuestion.explanation;
                  
                  // YouTube URL을 placeholder로 변환
                  processedContent = processedContent.replace(
                    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\S*)?/g,
                    (match, videoId) => {
                      return `<div class="video-placeholder" data-video-type="youtube" data-video-id="${videoId}" contenteditable="false" style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; cursor: pointer;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
                        <div style="font-weight: bold;">YouTube Video</div>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${videoId}</div>
                        <div style="font-size: 11px; color: #999; margin-top: 5px;">(저장 시 영상으로 변환됩니다)</div>
                      </div>`;
                    }
                  );
                  
                  // Vimeo URL을 placeholder로 변환
                  processedContent = processedContent.replace(
                    /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:\S*)?/g,
                    (match, videoId) => {
                      return `<div class="video-placeholder" data-video-type="vimeo" data-video-id="${videoId}" contenteditable="false" style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; cursor: pointer;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
                        <div style="font-weight: bold;">Vimeo Video</div>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${videoId}</div>
                        <div style="font-size: 11px; color: #999; margin-top: 5px;">(저장 시 영상으로 변환됩니다)</div>
                      </div>`;
                    }
                  );
                  
                  // 변환된 내용이 다른 경우에만 업데이트
                  if (processedContent !== currentQuestion.explanation) {
                    setCurrentQuestion({ ...currentQuestion, explanation: processedContent });
                  }
                }
              }}
            />
          </div>
        </div>
    </>
  );
};

export default Question;
