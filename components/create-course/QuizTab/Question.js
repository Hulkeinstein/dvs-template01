import React, { useState } from "react";

import Image from "next/image";

import TextEditorWrapper from "../TextEditorWrapper";

import img from "../../../public/images/others/thumbnail-placeholder.svg";

const Question = ({
  selectedOption,
  handleSelectChange,
  editor,
  answerEditor,
  currentQuestion: rawCurrentQuestion,
  setCurrentQuestion,
  isEditing,
}) => {
  // Ensure currentQuestion is always a safe object
  const currentQuestion = React.useMemo(() => {
    if (!rawCurrentQuestion) return {};
    try {
      // Deep clone to avoid any Zod references
      return JSON.parse(JSON.stringify(rawCurrentQuestion));
    } catch (e) {
      console.error('Error parsing currentQuestion:', e);
      return {};
    }
  }, [rawCurrentQuestion]);
  const [currentOption, setCurrentOption] = useState('');
  const [displayFormat, setDisplayFormat] = useState('text');
  const [optionImage, setOptionImage] = useState(null);
  const [questionImagePreview, setQuestionImagePreview] = useState(() => currentQuestion?.questionImage || null);
  const [blanks, setBlanks] = useState(() => currentQuestion?.blanks || []);
  const [blankAnswers, setBlankAnswers] = useState(() => {
    const answers = {};
    if (currentQuestion?.blanks) {
      currentQuestion.blanks.forEach(blank => {
        answers[blank.id] = blank.answers || [];
      });
    }
    return answers;
  });
  const [sortItems, setSortItems] = useState(() => currentQuestion?.sortItems || []);
  const [newSortItem, setNewSortItem] = useState('');
  // Matching states
  const [matchingLeftItems, setMatchingLeftItems] = useState(() => 
    currentQuestion?.matchingPairs?.leftItems || []
  );
  const [matchingRightItems, setMatchingRightItems] = useState(() => 
    currentQuestion?.matchingPairs?.rightItems || []
  );
  const [newLeftItem, setNewLeftItem] = useState('');
  const [newRightItem, setNewRightItem] = useState('');
  
  
  // Update preview when editing existing question
  React.useEffect(() => {
    if (currentQuestion?.questionImage) {
      setQuestionImagePreview(currentQuestion.questionImage);
    }
  }, [currentQuestion?.questionImage]);

  // Initialize blanks when editing Fill in the Blanks question
  React.useEffect(() => {
    if (selectedOption === 'Fill in the Blanks' || currentQuestion?.type === 'Fill in the Blanks') {
      if (currentQuestion?.blanks) {
        setBlanks(currentQuestion.blanks);
        const answers = {};
        currentQuestion.blanks.forEach(blank => {
          answers[blank.id] = blank.answers || [];
        });
        setBlankAnswers(answers);
      }
    }
  }, [selectedOption, currentQuestion?.type, currentQuestion?.blanks?.length]);

  // Initialize sort items when editing Sort Answer question
  React.useEffect(() => {
    if (selectedOption === 'Sort Answer' || currentQuestion?.type === 'Sort Answer') {
      if (currentQuestion?.sortItems) {
        setSortItems(currentQuestion.sortItems);
      }
    }
  }, [selectedOption, currentQuestion?.type, currentQuestion?.sortItems?.length]);

  // Initialize matching items when editing Matching question
  React.useEffect(() => {
    if (selectedOption === 'Matching' || currentQuestion?.type === 'Matching') {
      if (currentQuestion?.matchingPairs) {
        setMatchingLeftItems(currentQuestion.matchingPairs.leftItems || []);
        setMatchingRightItems(currentQuestion.matchingPairs.rightItems || []);
      } else {
        setMatchingLeftItems([]);
        setMatchingRightItems([]);
      }
    }
  }, [selectedOption, currentQuestion?.type]);

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
    const updatedOptions = currentQuestion.options.filter((opt, index) => {
      if (typeof opt === 'string') {
        return `opt_${index}` !== optionId;
      }
      // 새로운 ID 형식도 체크 (opt_0_1 형식)
      const currentOptId = opt.id || `opt_${index}`;
      return currentOptId !== optionId;
    });
    setCurrentQuestion({ 
      ...currentQuestion, 
      options: updatedOptions,
      // Reset correct answer if removed
      correctAnswer: currentQuestion.correctAnswer === optionId ? null : currentQuestion.correctAnswer
    });
  };

  const handleSetCorrectAnswer = (optionId) => {
    if (selectedOption === 'Single Choice' || currentQuestion.type === 'Single Choice') {
      setCurrentQuestion({ ...currentQuestion, correctAnswer: optionId });
    } else if (selectedOption === 'Multiple Choice' || currentQuestion.type === 'Multiple Choice') {
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

  // Fill in the Blanks specific functions
  const addBlank = () => {
    const newBlankId = blanks.length + 1;
    const newBlank = { id: newBlankId, answers: [], caseSensitive: false };
    const newBlanks = [...blanks, newBlank];
    setBlanks(newBlanks);
    setBlankAnswers({ ...blankAnswers, [newBlankId]: [] });
    
    // Add placeholder to question text and update currentQuestion
    const currentText = currentQuestion.question || '';
    setCurrentQuestion({ 
      ...currentQuestion, 
      question: currentText + ` [${newBlankId}]`,
      blanks: newBlanks,
      correctAnswer: {
        ...currentQuestion.correctAnswer,
        [newBlankId]: []
      }
    });
  };

  const removeBlank = (blankId) => {
    const newBlanks = blanks.filter(b => b.id !== blankId);
    setBlanks(newBlanks);
    
    const newAnswers = { ...blankAnswers };
    delete newAnswers[blankId];
    setBlankAnswers(newAnswers);
    
    const newCorrectAnswer = { ...currentQuestion.correctAnswer };
    delete newCorrectAnswer[blankId];
    
    setCurrentQuestion({
      ...currentQuestion,
      blanks: newBlanks,
      correctAnswer: newCorrectAnswer
    });
  };

  const addAnswerToBlank = (blankId, answer) => {
    if (!answer.trim()) return;
    
    const currentAnswers = blankAnswers[blankId] || [];
    const newAnswers = [...currentAnswers, answer];
    
    setBlankAnswers({
      ...blankAnswers,
      [blankId]: newAnswers
    });
    
    // Update blanks and currentQuestion
    const updatedBlanks = blanks.map(blank => 
      blank.id === blankId ? { ...blank, answers: newAnswers } : blank
    );
    
    setBlanks(updatedBlanks);
    setCurrentQuestion({
      ...currentQuestion,
      blanks: updatedBlanks,
      correctAnswer: {
        ...currentQuestion.correctAnswer,
        [blankId]: newAnswers
      }
    });
  };

  const removeAnswerFromBlank = (blankId, answerIndex) => {
    const currentAnswers = blankAnswers[blankId] || [];
    const newAnswers = currentAnswers.filter((_, idx) => idx !== answerIndex);
    
    setBlankAnswers({
      ...blankAnswers,
      [blankId]: newAnswers
    });
    
    // Update blanks and currentQuestion
    const updatedBlanks = blanks.map(blank => 
      blank.id === blankId ? { ...blank, answers: newAnswers } : blank
    );
    
    setBlanks(updatedBlanks);
    setCurrentQuestion({
      ...currentQuestion,
      blanks: updatedBlanks,
      correctAnswer: {
        ...currentQuestion.correctAnswer,
        [blankId]: newAnswers
      }
    });
  };

  const updateBlankSettings = (blankId, settings) => {
    const updatedBlanks = blanks.map(blank => 
      blank.id === blankId ? { ...blank, ...settings } : blank
    );
    
    setBlanks(updatedBlanks);
    
    // Update currentQuestion with new blank settings
    const updatedBlanksWithAnswers = updatedBlanks.map(blank => ({
      ...blank,
      answers: blankAnswers[blank.id] || []
    }));
    
    setCurrentQuestion({
      ...currentQuestion,
      blanks: updatedBlanksWithAnswers
    });
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

  // Sort Answer specific functions
  const addSortItem = () => {
    if (!newSortItem.trim()) return;
    
    const newItem = {
      id: Date.now(),
      text: newSortItem,
      order: sortItems.length + 1
    };
    
    const updatedItems = [...sortItems, newItem];
    setSortItems(updatedItems);
    setNewSortItem('');
    
    // Update currentQuestion
    setCurrentQuestion({
      ...currentQuestion,
      sortItems: updatedItems,
      correctAnswer: updatedItems.map(item => item.id)
    });
  };

  const removeSortItem = (itemId) => {
    const updatedItems = sortItems
      .filter(item => item.id !== itemId)
      .map((item, index) => ({ ...item, order: index + 1 }));
    
    setSortItems(updatedItems);
    
    setCurrentQuestion({
      ...currentQuestion,
      sortItems: updatedItems,
      correctAnswer: updatedItems.map(item => item.id)
    });
  };

  const moveSortItem = (fromIndex, toIndex) => {
    const newItems = [...sortItems];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    
    // Update order
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setSortItems(updatedItems);
    
    setCurrentQuestion({
      ...currentQuestion,
      sortItems: updatedItems,
      correctAnswer: updatedItems.map(item => item.id)
    });
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
              <option>Single Choice</option>
              <option>Multiple Choice</option>
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
              selectedOption === "Open Ended" ? "d-block" : "d-none"
            }`}
          >
            <small>
              <i className="feather-info"></i> No option is necessary for this
              answer type
            </small>
          </div>
          
          <div
            className={`course-field mt--20 ${
              selectedOption === "Sort Answer" || currentQuestion.type === "Sort Answer" ? "d-block" : "d-none"
            }`}
          >
            <div className="mb--20">
              <h6>Items to Sort</h6>
              <small className="d-block mb-2">
                <i className="feather-info"></i> Add items in the correct order. Students will need to arrange them correctly.
              </small>
              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter an item to sort"
                  value={newSortItem}
                  onChange={(e) => setNewSortItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSortItem();
                    }
                  }}
                />
                <button 
                  className="rbt-btn btn-sm btn-primary" 
                  type="button"
                  onClick={addSortItem}
                >
                  <i className="feather-plus"></i> Add
                </button>
              </div>
            </div>

            {/* Sort Items List */}
            {sortItems.length > 0 && (
              <div className="mt--20">
                <h6 className="mb--10">Correct Order (Drag to reorder)</h6>
                <div className="sortable-list">
                  {sortItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="d-flex align-items-center gap-3 mb-2 p-3 border rounded bg-light"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        moveSortItem(fromIndex, index);
                      }}
                      style={{ cursor: 'move' }}
                    >
                      <i className="feather-menu"></i>
                      <span className="fw-bold">{index + 1}.</span>
                      <span className="flex-grow-1">{item.text}</span>
                      <button
                        type="button"
                        className="rbt-btn-close"
                        onClick={() => removeSortItem(item.id)}
                      >
                        <i className="feather-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <small className="text-muted mt-2 d-block">
                  <i className="feather-info"></i> The order shown here is the correct answer
                </small>
              </div>
            )}
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
              selectedOption === "Matching" ||
              (isEditing && (currentQuestion.type === "Single Choice" || 
                           currentQuestion.type === "Multiple Choice" ||
                           currentQuestion.type === "Matching"))
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
                    {currentQuestion.options.map((option, index) => {
                      // Handle both string and object options
                      const optionId = typeof option === 'string' ? `opt_${index}` : (option.id || `opt_${index}`);
                      const optionText = typeof option === 'string' ? option : option.text;
                      
                      const shouldShowRadioButton = selectedOption === 'Single Choice' || currentQuestion.type === 'Single Choice';
                      
                      return (
                        <div key={optionId} className="rbt-accordion-item card mb--10">
                          <div className="rbt-accordion-body card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-3">
                                {(selectedOption === 'Single Choice' || currentQuestion.type === 'Single Choice') && (
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      currentQuestion.correctAnswer === optionId || 
                                      currentQuestion.correctAnswer === index
                                        ? 'btn-success' 
                                        : 'btn-outline-secondary'
                                    }`}
                                    onClick={() => handleSetCorrectAnswer(optionId)}
                                    style={{ minWidth: '40px' }}
                                  >
                                    <i className={`feather-${
                                      currentQuestion.correctAnswer === optionId || 
                                      currentQuestion.correctAnswer === index
                                        ? 'check-circle' 
                                        : 'circle'
                                    }`}></i>
                                  </button>
                                )}
                                {(selectedOption === 'Multiple Choice' || currentQuestion.type === 'Multiple Choice') && (
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      currentQuestion.correctAnswer?.includes(optionId) || 
                                      currentQuestion.correctAnswer?.includes(index)
                                        ? 'btn-primary' 
                                        : 'btn-outline-secondary'
                                    }`}
                                    onClick={() => handleSetCorrectAnswer(optionId)}
                                    style={{ minWidth: '40px' }}
                                  >
                                    <i className={`feather-${
                                      currentQuestion.correctAnswer?.includes(optionId) || 
                                      currentQuestion.correctAnswer?.includes(index)
                                        ? 'check-square' 
                                        : 'square'
                                    }`}></i>
                                  </button>
                                )}
                                <span className="fw-bold">Option {index + 1}:</span>
                                <span>{optionText}</span>
                                {typeof option === 'object' && option.image && (displayFormat === 'image' || displayFormat === 'both') && (
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
                                onClick={() => handleRemoveOption(optionId)}
                              >
                                <i className="feather-x"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
          
          {/* Matching Question Type */}
          <div
            className={`course-field mt--20 ${
              selectedOption === "Matching" || currentQuestion.type === "Matching" ? "d-block" : "d-none"
            }`}
          >
            <h6>Matching Items</h6>
            <small className="d-block mb-3">
              <i className="feather-info"></i> Create items for the left and right columns. Students will match items from left to right.
            </small>
            
            <div className="row">
              {/* Left Column */}
              <div className="col-md-6">
                <h6>Left Column Items</h6>
                <div className="d-flex gap-2 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter left item"
                    value={newLeftItem}
                    onChange={(e) => setNewLeftItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newLeftItem.trim()) {
                        e.preventDefault();
                        const newItem = {
                          id: `left_${Date.now()}`,
                          text: newLeftItem.trim()
                        };
                        setMatchingLeftItems([...matchingLeftItems, newItem]);
                        setNewLeftItem('');
                        
                        // Update currentQuestion
                        setCurrentQuestion({
                          ...currentQuestion,
                          matchingPairs: {
                            leftItems: [...matchingLeftItems, newItem],
                            rightItems: matchingRightItems,
                            correctMatches: (currentQuestion.matchingPairs && currentQuestion.matchingPairs.correctMatches) || {}
                          }
                        });
                      }
                    }}
                  />
                  <button
                    className="rbt-btn btn-sm btn-primary"
                    type="button"
                    onClick={() => {
                      if (newLeftItem.trim()) {
                        const newItem = {
                          id: `left_${Date.now()}`,
                          text: newLeftItem.trim()
                        };
                        setMatchingLeftItems([...matchingLeftItems, newItem]);
                        setNewLeftItem('');
                        
                        // Update currentQuestion
                        setCurrentQuestion({
                          ...currentQuestion,
                          matchingPairs: {
                            leftItems: [...matchingLeftItems, newItem],
                            rightItems: matchingRightItems,
                            correctMatches: (currentQuestion.matchingPairs && currentQuestion.matchingPairs.correctMatches) || {}
                          }
                        });
                      }
                    }}
                  >
                    <i className="feather-plus"></i>
                  </button>
                </div>
                
                {/* Left Items List */}
                {matchingLeftItems.map((item, index) => (
                  <div key={item.id} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                    <span className="flex-grow-1">{item.text}</span>
                    <button
                      type="button"
                      className="rbt-btn-close"
                      onClick={() => {
                        const updatedItems = matchingLeftItems.filter(i => i.id !== item.id);
                        setMatchingLeftItems(updatedItems);
                        
                        // Remove from correct matches
                        const updatedMatches = { ...((currentQuestion.matchingPairs && currentQuestion.matchingPairs.correctMatches) || {}) };
                        delete updatedMatches[item.id];
                        
                        setCurrentQuestion({
                          ...currentQuestion,
                          matchingPairs: {
                            leftItems: updatedItems,
                            rightItems: matchingRightItems,
                            correctMatches: updatedMatches
                          }
                        });
                      }}
                    >
                      <i className="feather-x"></i>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Right Column */}
              <div className="col-md-6">
                <h6>Right Column Items</h6>
                <div className="d-flex gap-2 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter right item"
                    value={newRightItem}
                    onChange={(e) => setNewRightItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newRightItem.trim()) {
                        e.preventDefault();
                        const newItem = {
                          id: `right_${Date.now()}`,
                          text: newRightItem.trim()
                        };
                        setMatchingRightItems([...matchingRightItems, newItem]);
                        setNewRightItem('');
                        
                        // Update currentQuestion
                        setCurrentQuestion({
                          ...currentQuestion,
                          matchingPairs: {
                            leftItems: matchingLeftItems,
                            rightItems: [...matchingRightItems, newItem],
                            correctMatches: (currentQuestion.matchingPairs && currentQuestion.matchingPairs.correctMatches) || {}
                          }
                        });
                      }
                    }}
                  />
                  <button
                    className="rbt-btn btn-sm btn-primary"
                    type="button"
                    onClick={() => {
                      if (newRightItem.trim()) {
                        const newItem = {
                          id: `right_${Date.now()}`,
                          text: newRightItem.trim()
                        };
                        setMatchingRightItems([...matchingRightItems, newItem]);
                        setNewRightItem('');
                        
                        // Update currentQuestion
                        setCurrentQuestion({
                          ...currentQuestion,
                          matchingPairs: {
                            leftItems: matchingLeftItems,
                            rightItems: [...matchingRightItems, newItem],
                            correctMatches: (currentQuestion.matchingPairs && currentQuestion.matchingPairs.correctMatches) || {}
                          }
                        });
                      }
                    }}
                  >
                    <i className="feather-plus"></i>
                  </button>
                </div>
                
                {/* Right Items List */}
                {matchingRightItems.map((item, index) => (
                  <div key={item.id} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                    <span className="flex-grow-1">{item.text}</span>
                    <button
                      type="button"
                      className="rbt-btn-close"
                      onClick={() => {
                        const updatedItems = matchingRightItems.filter(i => i.id !== item.id);
                        setMatchingRightItems(updatedItems);
                        
                        // Remove from correct matches (where this item is the value)
                        const updatedMatches = { ...((currentQuestion.matchingPairs && currentQuestion.matchingPairs.correctMatches) || {}) };
                        Object.keys(updatedMatches).forEach(key => {
                          if (updatedMatches[key] === item.id) {
                            delete updatedMatches[key];
                          }
                        });
                        
                        setCurrentQuestion({
                          ...currentQuestion,
                          matchingPairs: {
                            leftItems: matchingLeftItems,
                            rightItems: updatedItems,
                            correctMatches: updatedMatches
                          }
                        });
                      }}
                    >
                      <i className="feather-x"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Correct Matches Setup */}
            {matchingLeftItems.length > 0 && matchingRightItems.length > 0 && (
              <div className="mt-4">
                <h6>Set Correct Matches</h6>
                <small className="d-block mb-3">
                  <i className="feather-info"></i> Select the correct match for each left item.
                </small>
                {matchingLeftItems.map(leftItem => (
                  <div key={leftItem.id} className="d-flex align-items-center gap-3 mb-2">
                    <span style={{ minWidth: '150px' }}>{leftItem.text}</span>
                    <i className="feather-arrow-right"></i>
                    <select
                      className="form-select"
                      value={(currentQuestion.matchingPairs && currentQuestion.matchingPairs.correctMatches && currentQuestion.matchingPairs.correctMatches[leftItem.id]) || ''}
                      onChange={(e) => {
                        const updatedMatches = {
                          ...((currentQuestion.matchingPairs && currentQuestion.matchingPairs.correctMatches) || {}),
                          [leftItem.id]: e.target.value
                        };
                        
                        setCurrentQuestion({
                          ...currentQuestion,
                          matchingPairs: {
                            leftItems: matchingLeftItems,
                            rightItems: matchingRightItems,
                            correctMatches: updatedMatches
                          },
                          correctAnswer: updatedMatches
                        });
                      }}
                    >
                      <option value="">Select correct match</option>
                      {matchingRightItems.map(rightItem => (
                        <option key={rightItem.id} value={rightItem.id}>
                          {rightItem.text}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div
            className={`course-field mt--20 ${
              selectedOption === "Fill in the Blanks" || currentQuestion.type === "Fill in the Blanks" ? "d-block" : "d-none"
            }`}
          >
            <div className="mb--20">
              <h6>Question with Blanks</h6>
              <small className="d-block mb-2">
                <i className="feather-info"></i> Write your question and click "Add Blank" to insert blank spaces. 
                Blanks will appear as [1], [2], etc.
              </small>
              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Example: The capital of [1] is [2]"
                  value={currentQuestion.question || ''}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                />
                <button 
                  className="rbt-btn btn-sm btn-primary" 
                  type="button"
                  onClick={addBlank}
                >
                  <i className="feather-plus"></i> Add Blank
                </button>
              </div>
            </div>

            {/* Preview */}
            {currentQuestion.question && (
              <div className="alert alert-light mb--20">
                <h6 className="mb-2">Preview:</h6>
                <div>
                  {currentQuestion.question.replace(/\[(\d+)\]/g, '________')}
                </div>
              </div>
            )}

            {/* Blanks Management */}
            {blanks.length > 0 && (
              <div className="mt--30">
                <h6 className="mb--20">Answer Options for Each Blank</h6>
                {blanks.map((blank, index) => (
                  <div key={blank.id} className="card mb--20 p-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Blank [{blank.id}]</h6>
                      <button
                        type="button"
                        className="rbt-btn-close"
                        onClick={() => removeBlank(blank.id)}
                      >
                        <i className="feather-x"></i>
                      </button>
                    </div>
                    
                    {/* Add answer input */}
                    <div className="d-flex gap-2 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter acceptable answer"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAnswerToBlank(blank.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        className="rbt-btn btn-sm"
                        type="button"
                        onClick={(e) => {
                          const input = e.target.parentElement.querySelector('input');
                          addAnswerToBlank(blank.id, input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </button>
                    </div>

                    {/* Answer list */}
                    {blankAnswers[blank.id] && blankAnswers[blank.id].length > 0 && (
                      <div className="mb-3">
                        <small className="text-muted mb-2 d-block">Acceptable answers:</small>
                        {blankAnswers[blank.id].map((answer, ansIdx) => (
                          <div key={ansIdx} className="d-inline-flex align-items-center gap-2 me-2 mb-2">
                            <span className="badge bg-secondary">{answer}</span>
                            <button
                              type="button"
                              className="btn btn-sm p-0"
                              style={{ lineHeight: 1 }}
                              onClick={() => removeAnswerFromBlank(blank.id, ansIdx)}
                            >
                              <i className="feather-x"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Settings */}
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`caseSensitive-${blank.id}`}
                        checked={blank.caseSensitive || false}
                        onChange={(e) => updateBlankSettings(blank.id, { caseSensitive: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor={`caseSensitive-${blank.id}`}>
                        Case sensitive (대소문자 구분)
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
