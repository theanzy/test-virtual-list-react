import React from 'react';
import styles from './Skeleton.module.css';
const Skeleton = ({ height }) => {
  return <span style={{ height: height }} className={styles.skeleton}></span>;
};

export default Skeleton;
