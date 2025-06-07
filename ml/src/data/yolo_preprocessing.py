import os
import cv2
import pandas as pd
import xml.etree.ElementTree as ET
import glob
from tqdm import tqdm
import shutil
from sklearn.model_selection import train_test_split
from typing import Tuple, List

class YOLODataProcessor:
    """Process data for YOLO training"""
    
    def __init__(self, annotations_dir: str, images_dir: str):
        self.annotations_dir = annotations_dir
        self.images_dir = images_dir
        
        # Validate directories exist
        if not os.path.exists(self.annotations_dir):
            raise ValueError(f"Annotations directory not found: {self.annotations_dir}")
        if not os.path.exists(self.images_dir):
            raise ValueError(f"Images directory not found: {self.images_dir}")
    
    def parse_xml_annotations(self) -> Tuple[pd.DataFrame, List[str]]:
        """Parse all XML annotations and create dataset"""
        xml_files = glob.glob(os.path.join(self.annotations_dir, '*.xml'))
        
        if not xml_files:
            raise ValueError(f"No XML files found in {self.annotations_dir}")
        
        dataset = []
        classes = set()
        
        print(f"Processing {len(xml_files)} XML files from {self.annotations_dir}...")
        
        for xml_file in tqdm(xml_files):
            try:
                tree = ET.parse(xml_file)
                root = tree.getroot()
                
                # Get image filename
                filename_elem = root.find('filename')
                if filename_elem is not None:
                    img_name = filename_elem.text
                else:
                    base_name = os.path.basename(xml_file).replace('.xml', '')
                    for ext in ['.jpg', '.jpeg', '.png', '.bmp']:
                        potential_img = base_name + ext
                        if os.path.exists(os.path.join(self.images_dir, potential_img)):
                            img_name = potential_img
                            break
                    else:
                        print(f"Warning: No matching image found for {xml_file}")
                        continue
                
                img_path = os.path.join(self.images_dir, img_name)
                if not os.path.exists(img_path):
                    print(f"Warning: Image not found: {img_path}")
                    continue
                
                # Get image dimensions
                size = root.find('size')
                if size is not None:
                    img_width = int(size.find('width').text)
                    img_height = int(size.find('height').text)
                else:
                    img = cv2.imread(img_path)
                    if img is None:
                        print(f"Warning: Could not read image: {img_path}")
                        continue
                    img_height, img_width = img.shape[:2]
                
                # Parse objects
                objects = root.findall('object')
                if not objects:
                    print(f"Warning: No objects found in {xml_file}")
                    continue
                
                for obj in objects:
                    name_elem = obj.find('name')
                    if name_elem is None:
                        print(f"Warning: No name found in object from {xml_file}")
                        continue
                    
                    name = name_elem.text
                    classes.add(name)
                    
                    bbox = obj.find('bndbox')
                    if bbox is None:
                        print(f"Warning: No bounding box found in object from {xml_file}")
                        continue
                    
                    try:
                        xmin = int(float(bbox.find('xmin').text))
                        ymin = int(float(bbox.find('ymin').text))
                        xmax = int(float(bbox.find('xmax').text))
                        ymax = int(float(bbox.find('ymax').text))
                    except (ValueError, AttributeError) as e:
                        print(f"Warning: Invalid bbox coordinates in {xml_file}: {e}")
                        continue
                    
                    # Validate bounding box
                    if xmin >= xmax or ymin >= ymax:
                        print(f"Warning: Invalid bounding box in {xml_file}: ({xmin},{ymin},{xmax},{ymax})")
                        continue
                    
                    dataset.append({
                        'image_path': img_path,
                        'image_name': img_name,
                        'class': name,
                        'xmin': xmin, 'ymin': ymin,
                        'xmax': xmax, 'ymax': ymax,
                        'img_width': img_width,
                        'img_height': img_height
                    })
            
            except Exception as e:
                print(f"Error processing {xml_file}: {e}")
        
        if not dataset:
            raise ValueError("No valid annotations found!")
        
        print(f"Successfully processed {len(dataset)} annotations from {len(set([d['image_name'] for d in dataset]))} images")
        print(f"Found {len(classes)} classes: {sorted(classes)}")
        
        return pd.DataFrame(dataset), sorted(list(classes))
    
    def create_train_val_split(self, df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Create train/validation split"""
        unique_images = df.groupby('class')['image_name'].unique().reset_index()
        
        train_images = []
        val_images = []
        
        for _, row in unique_images.iterrows():
            class_images = row['image_name']
            
            if len(class_images) == 1:
                train_images.extend(class_images)
            else:
                train_imgs, val_imgs = train_test_split(
                    class_images, 
                    test_size=test_size, 
                    random_state=random_state
                )
                train_images.extend(train_imgs)
                val_images.extend(val_imgs)
        
        train_df = df[df['image_name'].isin(train_images)].copy()
        val_df = df[df['image_name'].isin(val_images)].copy()
        
        return train_df, val_df
    
    def prepare_yolo_dataset(self, train_df: pd.DataFrame, val_df: pd.DataFrame, 
                           all_classes: List[str], yolo_dir: str) -> dict:
        """Prepare dataset in YOLO format"""
        
        # Create YOLO directory structure
        for split in ['train', 'val']:
            for subdir in ['images', 'labels']:
                os.makedirs(os.path.join(yolo_dir, split, subdir), exist_ok=True)
        
        # Create class mapping
        class_to_id = {class_name: idx for idx, class_name in enumerate(all_classes)}
        
        # Process training data
        print("Preparing training data...")
        self._process_split(train_df, yolo_dir, 'train', class_to_id)
        
        # Process validation data
        print("Preparing validation data...")
        self._process_split(val_df, yolo_dir, 'val', class_to_id)
        
        # Create data.yaml file
        yaml_content = f"""train: {os.path.join(yolo_dir, 'train', 'images')}
val: {os.path.join(yolo_dir, 'val', 'images')}

nc: {len(all_classes)}
names: {all_classes}
"""
        
        with open(os.path.join(yolo_dir, 'data.yaml'), 'w') as f:
            f.write(yaml_content)
        
        return class_to_id
    
    def _process_split(self, df: pd.DataFrame, yolo_dir: str, split: str, class_to_id: dict):
        """Process data for a specific split"""
        for image_name, group in tqdm(df.groupby('image_name')):
            # Copy image
            src_img = group.iloc[0]['image_path']
            dst_img = os.path.join(yolo_dir, split, 'images', image_name)
            shutil.copy2(src_img, dst_img)
            
            # Create label file
            label_file = os.path.join(yolo_dir, split, 'labels', 
                                    image_name.rsplit('.', 1)[0] + '.txt')
            
            with open(label_file, 'w') as f:
                for _, row in group.iterrows():
                    class_id = class_to_id[row['class']]
                    
                    # Convert to YOLO format (normalized coordinates)
                    x_center = (row['xmin'] + row['xmax']) / 2 / row['img_width']
                    y_center = (row['ymin'] + row['ymax']) / 2 / row['img_height']
                    width = (row['xmax'] - row['xmin']) / row['img_width']
                    height = (row['ymax'] - row['ymin']) / row['img_height']
                    
                    f.write(f"{class_id} {x_center} {y_center} {width} {height}\n")